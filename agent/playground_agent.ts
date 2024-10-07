import { type JobContext, WorkerOptions, cli, defineAgent, multimodal } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import type { LocalParticipant, Participant, TrackPublication } from "@livekit/rtc-node";
import { RemoteParticipant, TrackSource } from "@livekit/rtc-node";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger";
import { determineNextStateAndPrompt } from "./logic-ai";
// Optional: Import dotenv if you're using it to load environment variables
import "dotenv/config";
import { getMicrophoneTrackSid, parseSessionConfig } from "./utils";
import { alexPrompt } from "./prompt";

// Create a list to track the conversation history
export const conversationHistory: { role: string; content: string }[] = [];
export let currentState = "Initial Contact";
// Function to track the conversation in the required format
export function trackConversation(role: "user" | "assistant", content: string) {
  conversationHistory.push({ role, content });
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    logger.info("Agent entry function started");
    await ctx.connect();
    logger.info("Connected to LiveKit room");

    const participant = await ctx.waitForParticipant();
    logger.info(`Participant joined: ${participant.identity}`);

    await runMultimodalAgent(ctx, participant);
  },
});

async function runMultimodalAgent(ctx: JobContext, participant: RemoteParticipant) {
  logger.info("Starting multimodal agent");
  const metadata = JSON.parse(participant.metadata);
  logger.info("Participant metadata parsed:", metadata);

  const config = parseSessionConfig(metadata);
  logger.info(`Multimodal agent configuration: ${config}}`);

  const model = new openai.realtime.RealtimeModel({
    apiKey: config.openaiApiKey,
    instructions: alexPrompt + config.instructions,
    voice: config.voice,
    temperature: config.temperature,
    maxResponseOutputTokens: config.maxOutputTokens,
    modalities: config.modalities as ["text", "audio"] | ["text"],
    turnDetection: config.turnDetection!,
  });
  logger.info("Realtime model initialized");

  const agent = new multimodal.MultimodalAgent({ model });
  logger.info("Multimodal agent instance created");

  const session = (await agent.start(ctx.room)) as openai.realtime.RealtimeSession;
  logger.info("Agent session started");

  session.conversation.item.create({
    type: "message",
    role: "user",
    content: [
      {
        type: "input_text",
        text: "Please begin the interaction with the user in a manner consistent with your instructions.",
      },
    ],
  });
  logger.info("Initial conversation item created");
  session.response.create();
  logger.info("Initial response created");

  ctx.room.on("participantAttributesChanged", (changedAttributes: Record<string, string>, changedParticipant: Participant) => {
    if (changedParticipant !== participant) {
      return;
    }
    logger.info(`Participant attributes changed for ${changedParticipant.identity}:`, changedAttributes);

    const newConfig = parseSessionConfig({
      ...changedParticipant.attributes,
      ...changedAttributes,
    });
    logger.info("New configuration after attribute change:", config);

    session.sessionUpdate({
      instructions: newConfig.instructions,
      temperature: newConfig.temperature,
      maxResponseOutputTokens: newConfig.maxOutputTokens,
      modalities: newConfig.modalities as ["text", "audio"] | ["text"],
      turnDetection: newConfig.turnDetection,
    });
    logger.info("Session updated with new configuration");
  });

  async function sendTranscription(
    ctx: JobContext,
    participant: Participant,
    trackSid: string,
    segmentId: string,
    text: string,
    isFinal: boolean = true
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
            language: "",
            final: isFinal,
          },
        ],
      };
      await (ctx.room.localParticipant as LocalParticipant).publishTranscription(transcription);
      logger.info("Transcription published:", transcription);
    } catch (error) {
      logger.info("Error publishing transcription:", error);
    }
  }

  session.on("response_done", (response: openai.realtime.RealtimeResponse) => {
    // Log the chat response content
    const responseContent = response.output?.map((outputItem) => outputItem.content.map((c) => c.text).join(" ")).join("\n");

    if (responseContent) {
      logger.info(`GPT said: "${responseContent}"`);
      // Track the agent (AI) message in conversation history
      trackConversation("assistant", responseContent);
    }

    let message: string | undefined;

    if (response.status === "incomplete") {
      if (response.statusDetails?.type === "incomplete" && response.statusDetails.reason) {
        const reason = response.statusDetails.reason;
        logger.error("Response incomplete with reason:", reason);
        switch (reason) {
          case "max_output_tokens":
            message = "🚫 Max output tokens reached";
            break;
          case "content_filter":
            message = "🚫 Content filter applied";
            break;
          default:
            message = `🚫 Response incomplete: ${reason}`;
            break;
        }
      } else {
        message = "🚫 Response incomplete";
      }
    } else if (response.status === "failed") {
      if (response.statusDetails?.type === "failed" && response.statusDetails.error) {
        logger.error("Response failed with error:", response.statusDetails.error);
        const errorCode = response.statusDetails.error.code;
        switch (errorCode) {
          case "server_error":
            message = "⚠️ Server error";
            break;
          case "rate_limit_exceeded":
            message = "⚠️ Rate limit exceeded";
            break;
          default:
            message = "⚠️ Response failed";
            break;
        }
      } else {
        message = "⚠️ Response failed";
      }
    } else {
      return;
    }

    if (message) {
      logger.info("Sending transcription with message:", message);
      const localParticipant = ctx.room.localParticipant as LocalParticipant;
      const trackSid = getMicrophoneTrackSid(localParticipant);

      if (trackSid) {
        sendTranscription(ctx, localParticipant, trackSid, "status-" + uuidv4(), message);
      }
    }
  });

  // Additional event handlers with logging
  session.on("input_speech_started", () => {
    logger.info("Input speech started");
  });

  session.on("input_speech_transcription_completed", async (event: openai.realtime.InputSpeechTranscriptionCompleted) => {
    // Log the transcription text
    const transcriptText = event.transcript || "";

    if (transcriptText) {
      logger.info(`User said: "${transcriptText}"`);
      trackConversation("user", transcriptText);
    }
    // session.sessionUpdate({
    //     instructions: "Respond like a pirate!",
    //     modalities: ['text', 'audio'], // You can change modalities based on your needs
    //   });
    logger.info("fetching next state and instructions");
    const { nextState, ai1Instructions } = await determineNextStateAndPrompt(conversationHistory, currentState, alexPrompt);
    session.sessionUpdate({
      instructions: ai1Instructions,
      modalities: ["text", "audio"], // You can change modalities based on your needs
    });
    logger.info("Session updated");
    currentState = nextState;
  });

  session.on("input_speech_transcription_failed", (event) => {
    logger.info("Input speech transcription failed:", event);
  });
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { cli } from '@livekit/agents'; // Adjust this import based on your setup
import { WorkerOptions } from '@livekit/agents'; // Adjust this import based on your setup

// Define the absolute path to your agent
const agentPath = "fileURLToPath(import.meta.url)"
console.log(agentPath)
// Convert the Windows path to a file URL
const agentFileURL = new URL(`file:///${agentPath.replace(/\\/g, '/')}`); // Replace backslashes with forward slashes

console.log('Running agent with the following settings:');
console.log('Agent file path:', agentFileURL.toString()); // Log the file URL
console.log('API Key:', process.env.LIVEKIT_API_KEY);
console.log('API Secret:', process.env.LIVEKIT_API_SECRET);
console.log('WebSocket URL:', process.env.LIVEKIT_URL);

cli.runApp(
  new WorkerOptions({
    agent: "file:///C:/Users/joewi/Documents/Python%20Scripts/Gi/rekbot-js/rekbot-realtime/agent/playground_agent.ts", // Use the file URL
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    wsURL: process.env.LIVEKIT_URL,
  })
);
