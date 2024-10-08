You’re building a training system that simulates sales conversations using the Straight Line Selling technique, where users (your employees) practice their cold-calling skills by interacting with an AI-driven prospect persona. Here’s a comprehensive overview of the key components and functionalities of your system:

Overview of the System

	1.	AI-Driven Prospect Simulation:
	•	The system simulates a prospect (e.g., a business owner looking for website services) that can exhibit a variety of personalities and behavioral traits.
	•	The prospect persona is defined through a JSON structure that includes characteristics such as demeanor (rude, kind, chatty), current problems, fears, objections, and more.
	2.	Dynamic State Management:
	•	The prospect’s behavior and reactions are managed through a non-linear state machine that allows for multiple states (e.g., initial, rapport building, skeptical, interested, bored).
	•	Each state captures the prospect’s emotional state, awareness of the product, and engagement level during the conversation.
	3.	State Transitions:
	•	The prospect can transition between states based on a variety of triggers (e.g., positive engagement, effective objection handling, rude behavior).
	•	Each transition has associated responses that capture how the prospect feels, influencing the next steps in the conversation.
	4.	Feedback Mechanism:
	•	The system evaluates the caller’s performance throughout the interaction using metrics that are important to the Straight Line Selling method.
	•	Feedback is provided based on how well the caller navigates the sales process, handles objections, builds rapport, and closes the sale.
	5.	Behavioral Adjustments:
	•	The AI adapts the prospect’s behavior in real-time based on the caller’s performance. For instance, if the caller is not confident, the prospect may become more skeptical; if the caller is rude, the prospect may end the call.
	•	This adaptability allows for a realistic training experience where users can see the consequences of their actions during the call.
	6.	Scoring and Evaluation:
	•	The system continuously recalculates the caller’s progress along the Straight Line Selling framework, providing a score or evaluation based on their performance.
	•	This scoring system can help users identify areas for improvement and track their development over time.
	7.	Conversational History Tracking:
	•	The system may log the conversation’s history, including what the prospect said and how they reacted, to provide insights into the caller’s performance and the effectiveness of their selling techniques.

Goals of the System

	•	Training Tool: The primary aim is to serve as an effective training tool for employees to practice and refine their cold-calling techniques in a risk-free environment.
	•	Skill Development: By interacting with a realistic AI-driven prospect, users can improve their communication skills, learn to handle objections, and understand how to guide prospects through the sales process.
	•	Performance Metrics: The system will offer quantifiable performance metrics to help users understand their strengths and weaknesses in the sales process, allowing for targeted improvement.

Potential Enhancements

	•	Analytics Dashboard: Create a dashboard that visualizes user performance over time, tracking metrics such as success rates, common objections faced, and areas of improvement.
	•	Feedback Loops: Implement a feedback loop where users can receive tips or best practices after each call based on their performance.
	•	Customizable Prospect Personas: Allow users or managers to create and customize prospect personas for specific training scenarios, tailoring the experience to different industries or products.

This training system you are developing is designed to enhance the skills of sales professionals by providing them with an interactive, engaging, and adaptive learning environment. If you have any specific areas you’d like to focus on or further questions about the system, feel free to let me know!

Straight Line Selling is a sales methodology developed by Jordan Belfort, a former stockbroker and author of the memoir The Wolf of Wall Street. The system is designed to help sales professionals close deals more efficiently by guiding prospects through a linear, structured selling process.

Core Principles of Straight Line Selling:

	1.	Establishing Rapport: Building a genuine connection with the prospect to foster trust and openness.
	2.	Controlling the Conversation: Steering the dialogue in a purposeful direction while keeping the prospect engaged.
	3.	Identifying Needs: Asking strategic questions to uncover the prospect’s pain points, desires, and objectives.
	4.	Presenting Solutions: Aligning the product or service with the prospect’s identified needs in a compelling way.
	5.	Creating Urgency: Encouraging prompt decision-making by highlighting the benefits of taking immediate action.
	6.	Handling Objections: Addressing concerns confidently and effectively to remove barriers to the sale.
	7.	Closing the Deal: Securing a commitment from the prospect to complete the transaction.

The “Straight Line” Metaphor:

The methodology is named for its focus on keeping the sales process on a “straight line” from introduction to close. Deviations or tangents are minimized to maintain momentum and prevent the conversation from drifting away from the end goal.

Emphasis on Certainty:

A key aspect of Straight Line Selling is creating a high level of certainty in three areas:

	•	The Product or Service: Ensuring the prospect believes in the value and benefits of what is being offered.
	•	The Company: Establishing credibility and trust in the organization behind the product.
	•	The Salesperson: Building confidence in oneself as a trustworthy and competent advisor.

Application Across Industries:

While initially developed for high-stakes financial sales, the principles of Straight Line Selling have been adapted for use in various industries, including real estate, automotive sales, and technology solutions.

Training and Resources:

Jordan Belfort offers training programs, workshops, and online courses that delve deeper into the techniques and psychology behind the Straight Line System. These resources often include scripts, role-playing exercises, and real-world examples to help sales professionals hone their skills.

Ethical Considerations:

It’s important to apply the Straight Line Selling techniques ethically, prioritizing the prospect’s best interests. Building genuine relationships and offering real value should remain at the forefront of any sales strategy.

Conclusion:

Straight Line Selling provides a structured approach to sales that emphasizes efficiency, control, and effective communication. By guiding prospects along a direct path and addressing their needs confidently, sales professionals can enhance their ability to close deals successfully.

Certainly! Developing an AI-driven training framework for cold callers using the principles of Straight Line Selling is an excellent way to enhance sales skills. Below is a comprehensive framework that outlines how the AI prospect should function, including how it determines whether the cold caller wins or loses the sale.

1. AI Prospect Persona Development

a. Diverse Personas

	•	Role and Industry: Create AI personas representing various industries (e.g., healthcare, technology, finance) and roles (e.g., CEO, HR manager, procurement officer).
	•	Demographics: Include age, gender, location, and company size to add realism.
	•	Personality Traits: Assign traits like skeptical, friendly, busy, or analytical to influence responses.
	•	Pain Points and Needs: Define specific challenges or goals relevant to each persona’s role and industry.

b. Emotional States

	•	Baseline Emotion: Start with a default emotional state (e.g., neutral, indifferent).
	•	Emotional Triggers: Identify triggers that can positively or negatively affect the prospect’s emotions during the call.

2. Interaction Flow Based on Straight Line Selling

a. Introduction Phase

	•	Initial Greeting Response: The AI reacts to the cold caller’s opening, assessing tone and professionalism.
	•	Attention Capture: Determines if the cold caller effectively captures attention within the first few seconds.

b. Building Rapport

	•	Connection Attempts: Evaluates attempts to establish common ground or mutual interests.
	•	Active Listening: Assesses if the cold caller is attentive and responsive to cues.

c. Needs Identification

	•	Questioning Strategy: Analyzes the quality and relevance of questions asked.
	•	Information Disclosure: Provides information proportionate to the cold caller’s effectiveness in building rapport.

d. Presentation of Solution

	•	Alignment with Needs: Checks if the proposed solution directly addresses identified pain points.
	•	Clarity and Persuasiveness: Evaluates the clarity of the pitch and the persuasive techniques used.

e. Creating Urgency

	•	Value Proposition: Assesses how well the cold caller communicates the benefits of acting promptly.
	•	Scarcity and Time Sensitivity: Responds to strategies that highlight limited availability or time-bound offers.

f. Handling Objections

	•	Objection Simulation: Presents common objections (e.g., price, timing, need to consult others).
	•	Response Evaluation: Rates the effectiveness of the cold caller’s rebuttals and reassurance tactics.

g. Closing the Deal

	•	Commitment Level: Determines willingness to proceed based on the cumulative interaction.
	•	Final Decision: Decides to accept or decline the offer, influenced by the cold caller’s overall performance.

3. Certainty Scoring Mechanism

a. Three Key Elements

The AI prospect maintains internal certainty scores (on a scale of 1 to 10) for:

	1.	Product/Service Certainty
	2.	Company Certainty
	3.	Salesperson Certainty

b. Score Adjustments

	•	Positive Influences: Effective communication, rapport, and handling objections increase scores.
	•	Negative Influences: Poor listening, pushiness, or inability to address concerns decrease scores.

c. Thresholds for Success

	•	Winning the Sale: Achieved when all three certainty scores reach at least 8 out of 10.
	•	Losing the Sale: If any score remains below 5 after all interaction phases.

4. Dynamic Objection Handling

a. Common Objections

	•	Price Concerns: “It’s too expensive.”
	•	Need for Time: “I need to think about it.”
	•	Authority: “I need to consult with my team.”
	•	Value Doubt: “I’m not sure this will work for me.”

b. Escalation of Objections

	•	If initial objections are not adequately addressed, the AI introduces more challenging concerns.

5. Feedback and Coaching

a. Immediate Feedback

	•	Strengths Highlighted: Points out areas where the cold caller performed well.
	•	Areas for Improvement: Provides specific advice on what could be improved.

b. Detailed Analysis

	•	Transcript Review: Offers a breakdown of the conversation with annotations.
	•	Score Explanation: Explains how each certainty score was affected throughout the call.

6. Customization and Difficulty Levels

a. Skill Levels

	•	Beginner: AI is more forgiving, presents fewer objections.
	•	Intermediate: AI has balanced responses with standard objections.
	•	Advanced: AI is skeptical, presents multiple complex objections.

b. Scenario Variations

	•	Product Types: Adjusts the product or service being sold to keep training diverse.
	•	Market Conditions: Introduces factors like budget cuts or market saturation.

7. Integration of Ethical Selling Practices

a. Emphasis on Integrity

	•	The AI rewards honesty, transparency, and genuine concern for the prospect’s needs.

b. Penalizing Manipulative Tactics

	•	Deduces certainty scores if the cold caller uses unethical persuasion techniques.

8. Technical Implementation Considerations

a. Natural Language Processing (NLP)

	•	Utilizes NLP to understand and respond to the cold caller’s dialogue dynamically.

b. Machine Learning

	•	Adaptive Learning: The AI improves its responses over time based on accumulated interactions.
	•	Pattern Recognition: Identifies common mistakes to provide better feedback.

9. Data Privacy and Compliance

a. Simulation Only

	•	Ensures all interactions are simulated, with no real personal data used.

b. Compliance Standards

	•	Adheres to data protection regulations and ethical AI use guidelines.

Conclusion

By implementing this framework, the AI prospect will serve as an effective training tool for cold callers to practice and refine their Straight Line Selling techniques. The system focuses on realistic interactions, dynamic responses, and detailed feedback to foster continuous improvement.

Next Steps for Implementation:

	•	Develop AI Personas: Create a database of diverse prospect profiles.
	•	Design Interaction Scripts: Outline possible dialogue paths and responses.
	•	Program Certainty Algorithms: Implement scoring mechanisms for real-time adjustments.
	•	Pilot Testing: Run initial tests with sample users to refine AI behavior.
	•	Gather Feedback: Continuously improve the system based on user experiences.

If you need assistance with any specific component of this framework or have questions about implementation, feel free to ask!



Here is my old code which was working. Use this to understand the framework that we were using. Somethings cant change like the types from livekit, openai etc. also the session.on("") events cant change either as they are determined by livekit, also there is important code here that does stuff like the transcribing that you shouldnt remove. You need to work within this framework. 

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


Okay this is the flow that i am thinking of using: 

Ai1 is loaded with a user persona and a config json file that is adjusted to the straight selling method. User speaks to AI 1, in the background we constantly asyncronously determine the state of AI1 using Ai2 which is fully aware of the state machine, and any other logic that we think we should give it. Using ai2 we create a prompt for AI1 for the next message it will receive. The process continues until the conversation ends. 
 
So here's what i want, i want AI2 to be determining the next state and generating the prompt for AI1, the reason we can do it asynchronoulsy is because we can have a lag of 1 message before the state updates in time for the second message then it should be good enough. Secondly i need AI1 to always stay in character and respond directly in character, thirdly i want almost no deterministic logic in code, i want AI2 to have all the ingredients, and input parameters it needs to accurately understand the next state and create the perfect prompt for AI1 - now give me the code, but make sure you give me the whole file so i can just copy and paste it. Secondly give me any config json files seperately and import them in. 

This is the code you have given me - it currently does not work:

import {
  JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  multimodal,
} from '@livekit/agents';
import * as livekitOpenAI from '@livekit/agents-plugin-openai';
import { Participant, TrackPublication } from '@livekit/rtc-node';
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
    voice: data.voice || '',
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
    if (transcriptText) {
      logger.info(`User said (speech): "${transcriptText}"`);

      // Add user input to conversation history
      conversationHistory.push({ role: 'user', content: transcriptText });

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

  // Handle any errors in speech transcription
  session.on('input_speech_transcription_failed', (event) => {
    logger.info('Input speech transcription failed:', event);
  });

  // You can also handle text input if there's an event for it
  // For example, if there's an event 'input_text_transcription_completed':
  /*
  session.on('input_text_transcription_completed', async (event) => {
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
  */
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


i get these logs:

[2024-10-06 00:47:25.743 +0100] INFO: Agent entry function started
[2024-10-06 00:47:26.104 +0100] INFO: Connected to LiveKit room
[2024-10-06 00:47:26.104 +0100] INFO: Participant joined: human
[2024-10-06 00:47:26.104 +0100] INFO: Starting multimodal agent
[2024-10-06 00:47:26.104 +0100] INFO: Parsing session configuration from data:
[2024-10-06 00:47:26.104 +0100] INFO: Parsed session configuration:
[2024-10-06 00:47:26.104 +0100] INFO: Multimodal agent configuration: {"openaiApiKey":"[REDACTED]","instructions":"","voice":"","temperature":0.8,"modalities":["text","audio"],"turnDetection":null}
[2024-10-06 00:47:26.105 +0100] INFO: AI1 model initialized
[2024-10-06 00:47:26.105 +0100] INFO: Multimodal agent instance created
[2024-10-06 00:47:26.435 +0100] INFO: Agent session started
[2024-10-06 00:47:26.435 +0100] INFO: Initial conversation item created
[00:47:27.189] ERROR (46364): OpenAI Realtime error {"type":"invalid_request_error","code":"invalid_value","message":"Invalid value: ''. Supported values are: 'alloy', 'echo', and 'shimmer'.","param":"session.voice","event_id":null}
    sessionId: "sess_AF8mcLWP95IO69sAJC6JH"
[00:47:27.194] ERROR (46364): OpenAI Realtime error {"type":"invalid_request_error","code":"invalid_value","message":"Invalid value: ''. Supported values are: 'alloy', 'echo', and 'shimmer'.","param":"session.voice","event_id":null}
    sessionId: "sess_AF8mcLWP95IO69sAJC6JH"
[2024-10-06 00:47:27.970 +0100] INFO: AI1 said: "Hello there! How can I help you today?"
[2024-10-06 00:47:38.384 +0100] INFO: AI1 said: "Great to meet you, Joe! I can definitely help with that. What kind of website are you looking to create? Is it for a business, a personal blog, an online portfolio, or something else?"
[2024-10-06 00:47:52.695 +0100] INFO: AI1 said: "Intriguing! What's your unique vision for your website? The more details you provide, the better I can assist you."
[00:49:43.995] WARN (46361): job is unresponsive

as you can see theres an error, and i am no longer logging the user input so you are doing something wrong, probably the transcribing that you removed. 

Please fix this.
always provide the full file so i can copy and paste