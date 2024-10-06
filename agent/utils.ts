
import { type JobContext, defineAgent } from "@livekit/agents";
import type { Participant, TrackPublication } from "@livekit/rtc-node";
import { TrackSource } from "@livekit/rtc-node";
import logger from "./logger";
// Optional: Import dotenv if you're using it to load environment variables
import "dotenv/config";


export function safeLogConfig(config: SessionConfig): string {
  const safeConfig = { ...config, openaiApiKey: "[REDACTED]" };
  return JSON.stringify(safeConfig);
}

export type TurnDetectionType = {
  type: "server_vad";
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
};

export interface SessionConfig {
  openaiApiKey: string;
  instructions: string;
  voice: string;
  temperature: number;
  maxOutputTokens?: number;
  modalities: string[];
  turnDetection: TurnDetectionType | null;
}

export function parseSessionConfig(data: any): SessionConfig {
  logger.info("Parsing session configuration from data:", data);
  const config: SessionConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    instructions: data.instructions || "",
    voice: data.voice || "",
    temperature: parseFloat(data.temperature || "0.8"),
    maxOutputTokens: data.max_output_tokens === "inf" ? Infinity : parseInt(data.max_output_tokens) || undefined,
    modalities: modalitiesFromString(data.modalities || "text_and_audio"),
    turnDetection: data.turn_detection ? JSON.parse(data.turn_detection) : null,
  };
  logger.info("Parsed session configuration:", safeLogConfig(config));
  return config;
}

export function modalitiesFromString(modalities: string): ["text", "audio"] | ["text"] {
  const modalitiesMap: { [key: string]: ["text", "audio"] | ["text"] } = {
    text_and_audio: ["text", "audio"],
    text_only: ["text"],
  };
  return modalitiesMap[modalities] || ["text", "audio"];
}

export function getMicrophoneTrackSid(participant: Participant): string | undefined {
  logger.info("Getting microphone track SID for participant:", participant.identity);
  const trackSid = Array.from(participant.trackPublications.values()).find(
    (track: TrackPublication) => track.source === TrackSource.SOURCE_MICROPHONE
  )?.sid;
  logger.info("Microphone track SID:", trackSid);
  return trackSid;
}
