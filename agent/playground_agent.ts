import {
  JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  multimodal,
} from '@livekit/agents';
import * as livekitOpenAI from '@livekit/agents-plugin-openai';
import { LocalParticipant, Participant, TrackPublication } from '@livekit/rtc-node';
import { RemoteParticipant, TrackSource } from '@livekit/rtc-node';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';
import 'dotenv/config';

// Import the prospect persona from a JSON file
import prospectPersona from './prospectPersona.json';

// Import the OpenAI Node.js SDK for AI2
import OpenAI from 'openai';

function safeLogConfig(config: SessionConfig): string {
  const safeConfig = { ...config, openaiApiKey: '[REDACTED]' };
  return JSON.stringify(safeConfig);
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    logger.info('Agent entry function started');
    await ctx.connect();
    logger.info('Connected to LiveKit room');

    const participant = await ctx.waitForParticipant();
    logger.info(`Participant joined: ${participant.identity}`);

    await runMultimodalAgent(ctx, participant);
  },
});

type TurnDetectionType = {
  type: 'server_vad';
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
};

interface SessionConfig {
  openaiApiKey: string;
  instructions: string;
  voice: string;
  temperature: number;
  maxOutputTokens?: number;
  modalities: string[];
  turnDetection: TurnDetectionType | null;
}

function parseSessionConfig(data: any): SessionConfig {
  logger.info('Parsing session configuration from data:', data);
  const config: SessionConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || data.openaiApiKey || '',
    instructions: data.instructions || '',
    voice: data.voice || 'alloy', // Set default voice to "alloy" to avoid invalid value error
    temperature: parseFloat(data.temperature || '0.8'),
    maxOutputTokens:
      data.maxOutputTokens === 'inf'
        ? Infinity
        : parseInt(data.maxOutputTokens) || undefined,
    modalities: data.modalities || ['text', 'audio'],
    turnDetection: data.turnDetection || null,
  };
  logger.info('Parsed session configuration:', safeLogConfig(config));
  return config;
}

function getMicrophoneTrackSid(participant: Participant): string | undefined {
  logger.info('Getting microphone track SID for participant:', participant.identity);
  const trackSid = Array.from(participant.trackPublications.values()).find(
    (track: TrackPublication) => track.source === TrackSource.SOURCE_MICROPHONE,
  )?.sid;
  logger.info('Microphone track SID:', trackSid);
  return trackSid;
}

async function runMultimodalAgent(ctx: JobContext, participant: RemoteParticipant) {
  logger.info('Starting multimodal agent');

  // Load session configuration
  const config = parseSessionConfig({});
  logger.info(`Multimodal agent configuration: ${safeLogConfig(config)}`);

  // Initialize conversation state
  let currentState = 'Initial Contact';
  let conversationHistory: { role: string; content: string }[] = [];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // AI1: The prospect interacting with the user
  const ai1Model = new livekitOpenAI.realtime.RealtimeModel({
    apiKey: config.openaiApiKey,
    voice: config.voice,
    temperature: config.temperature,
    maxResponseOutputTokens: config.maxOutputTokens,
    modalities: config.modalities as ['text', 'audio'] | ['text'],
    turnDetection: config.turnDetection!,
  });
  logger.info('AI1 model initialized');

  const agent = new multimodal.MultimodalAgent({ model: ai1Model });
  logger.info('Multimodal agent instance created');

  const session = (await agent.start(ctx.room)) as livekitOpenAI.realtime.RealtimeSession;
  logger.info('Agent session started');

  // Function for AI2 to determine the next state and generate AI1's prompt
  async function ai2DetermineNextStateAndPrompt(
    conversationHistory: { role: string; content: string }[],
    currentState: string,
  ): Promise<{ nextState: string; ai1Instructions: string }> {
    // Prepare the prompt for AI2
    const ai2Prompt = `
You are an assistant that manages the state of a sales conversation using the Straight Line Selling method.

Prospect Persona:
${JSON.stringify(prospectPersona, null, 2)}

Conversation History:
${conversationHistory.map((entry) => `${entry.role}: ${entry.content}`).join('\n')}

Current State: ${currentState}

Instructions:

1. Analyze the last user input and the conversation history.
2. Determine the next state based on the Straight Line Selling state machine.
3. Generate precise instructions for AI1 (the prospect) to respond appropriately in character, based on the new state and the prospect persona.

Provide your output in the following JSON format:

{
  "nextState": "Next State Name",
  "ai1Instructions": "Instructions for AI1 to generate the next response."
}

Do not include any additional text outside of the JSON format.
`;

    // Call OpenAI API to get AI2's response
    try {
      const ai2Response = await openai.chat.completions.create({
        model: 'gpt-4', // Use 'gpt-4' or another available model
        messages: [{ role: 'user', content: ai2Prompt }],
        max_tokens: 500,
        temperature: 0.7,
        stop: ['\n\n'],
      });

      const ai2Output = ai2Response.choices[0]?.message?.content?.trim() || '';
      logger.info('AI2 Output:', ai2Output);

      // Parse AI2's JSON output
      const parsedOutput = JSON.parse(ai2Output);
      return {
        nextState: parsedOutput.nextState || currentState,
        ai1Instructions: parsedOutput.ai1Instructions || '',
      };
    } catch (error) {
      logger.error('Error calling OpenAI API for AI2:', error);
      // Fallback to current state and default instructions
      return {
        nextState: currentState,
        ai1Instructions: `You are "${prospectPersona.name}", a ${prospectPersona.personalityTraits.join(
          ', ',
        )} owner of ${prospectPersona.business}. Respond appropriately to the user's last message, staying in character.`,
      };
    }
  }

  // Start the conversation
  const initialMessage = 'Please begin the interaction with the user.';
  conversationHistory.push({ role: 'assistant', content: initialMessage });

  // Use session.conversation.item.create to initiate the conversation
  session.conversation.item.create({
    type: 'message',
    role: 'user',
    content: [
      {
        type: 'input_text',
        text: initialMessage,
      },
    ],
  });
  logger.info('Initial conversation item created');

  // AI1's initial instructions
  const initialInstructions = `You are "${prospectPersona.name}", a ${prospectPersona.personalityTraits.join(
    ', ',
  )} owner of ${prospectPersona.business}. Your current state is "${currentState}". Respond appropriately to the user's initial message, staying in character.`;

  // Update the session with initial instructions and modalities
  session.sessionUpdate({
    instructions: initialInstructions,
    modalities: config.modalities as ['text', 'audio'],
  });

  // AI1 generates the initial response
  session.response.create();

  // Handle AI1 responses
  session.on('response_done', (response: livekitOpenAI.realtime.RealtimeResponse) => {
    // Extract AI1's response content
    const ai1Response = response.output
      ?.map((outputItem) => outputItem.content.map((c) => c.text).join(' '))
      .join('\n');

    if (ai1Response) {
      logger.info(`AI1 said: "${ai1Response}"`);
      // Add AI1's response to the conversation history
      conversationHistory.push({ role: 'assistant', content: ai1Response });
    }

    // Wait for user's next input (handled in input_speech_transcription_completed)
  });

  // Handle user's speech input
  session.on('input_speech_transcription_completed', async (event) => {
    const transcriptText = event.transcript || '';
    const trackSid = getMicrophoneTrackSid(participant); // Get microphone track SID

    if (transcriptText && trackSid) {
      logger.info(`User said (speech): "${transcriptText}"`);

      // Add user input to conversation history
      conversationHistory.push({ role: 'user', content: transcriptText });

      // Send transcription
      const transcription = {
        participantIdentity: participant.identity,
        trackSid: trackSid,
        segments: [
          {
            id: uuidv4(),
            text: transcriptText,
            startTime: BigInt(0),
            endTime: BigInt(0),
            language: '',
            final: true,
          },
        ],
      };

      try {
        await (ctx.room.localParticipant as LocalParticipant).publishTranscription(transcription);
        logger.info('Transcription published:',
          transcription);
          logger.info('Transcription published successfully.');
        } catch (error) {
          logger.error('Error publishing transcription:', error);
        }
  
        // AI2 determines the next state and generates AI1's prompt
        const { nextState, ai1Instructions } = await ai2DetermineNextStateAndPrompt(
          conversationHistory,
          currentState,
        );
  
        currentState = nextState;
        logger.info(`AI2 determined next state: ${currentState}`);
  
        // Update the session with new instructions and modalities
        session.sessionUpdate({
          instructions: ai1Instructions,
          modalities: config.modalities as ['text', 'audio'],
        });
  
        // AI1 generates the next response
        session.response.create();
      } else {
        logger.error('Speech transcription failed: No track SID found or empty transcript.');
      }
    });
  
    // Handle any errors in speech transcription
    session.on('input_speech_transcription_failed', (event) => {
      logger.error('Input speech transcription failed:', event);
    });
  
    // Handle user's text input
    session.on('input_text', async (event) => {
      const textInput = event.text || '';
      if (textInput) {
        logger.info(`User said (text): "${textInput}"`);
  
        // Add user input to conversation history
        conversationHistory.push({ role: 'user', content: textInput });
  
        // AI2 determines the next state and generates AI1's prompt
        const { nextState, ai1Instructions } = await ai2DetermineNextStateAndPrompt(
          conversationHistory,
          currentState,
        );
  
        currentState = nextState;
        logger.info(`AI2 determined next state: ${currentState}`);
  
        // Update the session with new instructions and modalities
        session.sessionUpdate({
          instructions: ai1Instructions,
          modalities: config.modalities as ['text', 'audio'],
        });
  
        // AI1 generates the next response
        session.response.create();
      }
    });
  
    // Error handling for responses
    session.on('response_failed', (event) => {
      logger.error('AI1 response failed:', event);
    });
  }
  
  // Run the agent application
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
      apiKey: process.env.LIVEKIT_API_KEY,
      apiSecret: process.env.LIVEKIT_API_SECRET,
      wsURL: process.env.LIVEKIT_URL,
    }),
  );