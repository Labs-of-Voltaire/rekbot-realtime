import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  multimodal,
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import type {
  LocalParticipant,
  Participant,
  TrackPublication,
} from "@livekit/rtc-node";
import {
  RemoteParticipant,
  TrackSource,
} from "@livekit/rtc-node";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import logger from './logger';

// Optional: Import dotenv if you're using it to load environment variables
import 'dotenv/config';

function safeLogConfig(config: SessionConfig): string {
  const safeConfig = { ...config, openaiApiKey: "[REDACTED]" };
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
  type: "server_vad";
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
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    instructions: data.instructions || '',
    voice: data.voice || '',
    temperature: parseFloat(data.temperature || '0.8'),
    maxOutputTokens:
      data.max_output_tokens === 'inf'
        ? Infinity
        : parseInt(data.max_output_tokens) || undefined,
    modalities: modalitiesFromString(data.modalities || 'text_and_audio'),
    turnDetection: data.turn_detection ? JSON.parse(data.turn_detection) : null,
  };
  logger.info('Parsed session configuration:', safeLogConfig(config));
  return config;
}

function modalitiesFromString(
  modalities: string,
): ['text', 'audio'] | ['text'] {
  const modalitiesMap: { [key: string]: ['text', 'audio'] | ['text'] } = {
    text_and_audio: ['text', 'audio'],
    text_only: ['text'],
  };
  return modalitiesMap[modalities] || ['text', 'audio'];
}

function getMicrophoneTrackSid(participant: Participant): string | undefined {
  logger.info(
    'Getting microphone track SID for participant:',
    participant.identity,
  );
  const trackSid = Array.from(participant.trackPublications.values()).find(
    (track: TrackPublication) =>
      track.source === TrackSource.SOURCE_MICROPHONE,
  )?.sid;
  logger.info('Microphone track SID:', trackSid);
  return trackSid;
}

async function runMultimodalAgent(
  ctx: JobContext,
  participant: RemoteParticipant,
) {
  logger.info('Starting multimodal agent');
  const metadata = JSON.parse(participant.metadata);
  logger.info('Participant metadata parsed:', metadata);

  const config = parseSessionConfig(metadata);
  logger.info(
    `Multimodal agent configuration: ${safeLogConfig(config)}`,
  );

  const model = new openai.realtime.RealtimeModel({
    apiKey: config.openaiApiKey,
    instructions: config.instructions,
    voice: config.voice,
    temperature: config.temperature,
    maxResponseOutputTokens: config.maxOutputTokens,
    modalities: config.modalities as ['text', 'audio'] | ['text'],
    turnDetection: config.turnDetection!,
  });
  logger.info('Realtime model initialized');

  const agent = new multimodal.MultimodalAgent({ model });
  logger.info('Multimodal agent instance created');

  const session = (await agent.start(
    ctx.room,
  )) as openai.realtime.RealtimeSession;
  logger.info('Agent session started');

  session.conversation.item.create({
    type: 'message',
    role: 'user',
    content: [
      {
        type: 'input_text',
        text: 'Please begin the interaction with the user in a manner consistent with your instructions.',
      },
    ],
  });
  logger.info('Initial conversation item created');
  session.response.create();
  logger.info('Initial response created');

  ctx.room.on(
    'participantAttributesChanged',
    (
      changedAttributes: Record<string, string>,
      changedParticipant: Participant,
    ) => {
      if (changedParticipant !== participant) {
        return;
      }
      logger.info(
        `Participant attributes changed for ${changedParticipant.identity}:`,
        changedAttributes,
      );

      const newConfig = parseSessionConfig({
        ...changedParticipant.attributes,
        ...changedAttributes,
      });
      logger.info(
        'New configuration after attribute change:',
        safeLogConfig(newConfig),
      );

      session.sessionUpdate({
        instructions: newConfig.instructions,
        temperature: newConfig.temperature,
        maxResponseOutputTokens: newConfig.maxOutputTokens,
        modalities: newConfig.modalities as ['text', 'audio'] | ['text'],
        turnDetection: newConfig.turnDetection,
      });
      logger.info('Session updated with new configuration');
    },
  );

  async function sendTranscription(
    ctx: JobContext,
    participant: Participant,
    trackSid: string,
    segmentId: string,
    text: string,
    isFinal: boolean = true,
  ) {
    try {
      const transcription = {
        participantIdentity: participant.identity,
        trackSid: trackSid,
        segments: [
          {
            id: segmentId,
            text: text,
            startTime: BigInt(0),
            endTime: BigInt(0),
            language: '',
            final: isFinal,
          },
        ],
      };
      await (
        ctx.room.localParticipant as LocalParticipant
      ).publishTranscription(transcription);
      logger.info('Transcription published:', transcription);
    } catch (error) {
      logger.info('Error publishing transcription:', error);
    }
  }

  session.on('response_done', (response: openai.realtime.RealtimeResponse) => {
    // Log the chat response content
    const responseContent = response.output?.map((outputItem) => 
      outputItem.content.map((c) => c.text).join(' ')
    ).join('\n');
  
    if (responseContent) {
      logger.info(`GPT said: "${responseContent}"`);
    }
  
    let message: string | undefined;
  
    if (response.status === 'incomplete') {
      if (response.statusDetails?.type === 'incomplete' && response.statusDetails.reason) {
        const reason = response.statusDetails.reason;
        switch (reason) {
          case 'max_output_tokens':
            message = '🚫 Max output tokens reached';
            break;
          case 'content_filter':
            message = '🚫 Content filter applied';
            break;
          default:
            message = `🚫 Response incomplete: ${reason}`;
            break;
        }
      } else {
        message = '🚫 Response incomplete';
      }
    } else if (response.status === 'failed') {
      if (response.statusDetails?.type === 'failed' && response.statusDetails.error) {
        const errorCode = response.statusDetails.error.code;
        switch (errorCode) {
          case 'server_error':
            message = '⚠️ Server error';
            break;
          case 'rate_limit_exceeded':
            message = '⚠️ Rate limit exceeded';
            break;
          default:
            message = '⚠️ Response failed';
            break;
        }
      } else {
        message = '⚠️ Response failed';
      }
    } else {
      return;
    }
  
    if (message) {
      logger.info('Sending transcription with message:', message);
      const localParticipant = ctx.room.localParticipant as LocalParticipant;
      const trackSid = getMicrophoneTrackSid(localParticipant);
  
      if (trackSid) {
        sendTranscription(ctx, localParticipant, trackSid, 'status-' + uuidv4(), message);
      }
    }
  });

  // Additional event handlers with logging
  session.on('input_speech_started', () => {
    // logger.info('Input speech started');
  });


  session.on('input_speech_transcription_completed', (event: openai.realtime.InputSpeechTranscriptionCompleted) => {
    // Log the transcription text
    const transcriptText = event.transcript || '';

    if (transcriptText) {
      logger.info(`User said: "${transcriptText}"`);
    }
  });

  session.on('input_speech_transcription_failed', (event) => {
    logger.info('Input speech transcription failed:', event);
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