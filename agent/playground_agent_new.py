from __future__ import annotations

import asyncio
import json
import logging
import uuid
from dataclasses import asdict, dataclass
from typing import Any, Dict, List

from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
    llm,
)
from livekit.agents.multimodal import MultimodalAgent
from livekit.plugins import openai
from openai import OpenAI  # OpenAI Python SDK
import os
from prompt import alexPrompt  # Assuming this is your prompt module

# Configure logging
logger = logging.getLogger("my-worker")
logger.setLevel(logging.INFO)

# Create a list to track the conversation history
conversation_history: List[Dict[str, str]] = []
current_state = "Initial Contact"

# Function to track the conversation in the required format
def track_conversation(role: str, content: str):
    conversation_history.append({"role": role, "content": content})


@dataclass
class SessionConfig:
    openai_api_key: str
    instructions: str
    voice: str
    temperature: float
    max_response_output_tokens: str | int
    modalities: list[str]
    turn_detection: openai.realtime.ServerVadOptions

    def __post_init__(self):
        if self.modalities is None:
            self.modalities = self._modalities_from_string("text_and_audio")

    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if k != "openai_api_key"}

    @staticmethod
    def _modalities_from_string(modalities: str) -> list[str]:
        modalities_map = {
            "text_and_audio": ["text", "audio"],
            "text_only": ["text"],
        }
        return modalities_map.get(modalities, ["text", "audio"])


def parse_session_config(data: Dict[str, Any]) -> SessionConfig:
    turn_detection = None

    if data.get("turn_detection"):
        turn_detection_json = json.loads(data.get("turn_detection"))
        turn_detection = openai.realtime.ServerVadOptions(
            threshold=turn_detection_json.get("threshold", 0.5),
            prefix_padding_ms=turn_detection_json.get("prefix_padding_ms", 200),
            silence_duration_ms=turn_detection_json.get("silence_duration_ms", 300),
        )
    else:
        turn_detection = openai.realtime.DEFAULT_SERVER_VAD_OPTIONS

    config = SessionConfig(
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        instructions=data.get("instructions", ""),
        voice=data.get("voice", "alloy"),
        temperature=float(data.get("temperature", 0.8)),
        max_response_output_tokens=data.get("max_output_tokens") if data.get("max_output_tokens") == 'inf' else int(data.get("max_output_tokens") or 2048),
        modalities=SessionConfig._modalities_from_string(
            data.get("modalities", "text_and_audio")
        ),
        turn_detection=turn_detection,
    )
    return config


# Initialize OpenAI client for AI2
text_openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Function to build the AI2 prompt
def build_ai2_prompt(
    conversation_history: List[Dict[str, str]], current_state: str, prospect_persona: Any
) -> str:
    return f"""
You are an assistant that manages the state of a sales conversation using the Straight Line Selling method.

Prospect Persona:
{json.dumps(prospect_persona, indent=2)}

Conversation History:
{chr(10).join([f'{entry["role"]}: {entry["content"]}' for entry in conversation_history])}

Current State: {current_state}

Instructions:

1. Analyze the last user input and the conversation history.
2. Determine the next state based on the Straight Line Selling state machine.
3. Generate precise instructions for AI1 (the prospect) to respond appropriately in character, based on the new state and the prospect persona.

Provide your output in the following JSON format:

{{
  "nextState": "Next State Name",
  "ai1Instructions": "Instructions for AI1 to generate the next response.",
  "summary": "1 line summary of the instructions."
}}

Do not include any additional text outside of the JSON format.
"""


# Function to parse the OpenAI response
def parse_ai2_response(
    response_content: str, current_state: str, prospect_persona: Any
) -> Dict[str, str]:
    try:
        parsed_output = json.loads(response_content)
        logger.info("*********** Summary %s", parsed_output.get("summary", ""))
        return {
            "nextState": parsed_output.get("nextState", current_state),
            "ai1Instructions": parsed_output.get("ai1Instructions", ""),
        }
    except Exception as error:
        logger.error("Error parsing AI2 response: %s", error)
        # Fallback to current state and default instructions
        return {
            "nextState": current_state,
            "ai1Instructions": f'You are "{prospect_persona["name"]}", a {", ".join(prospect_persona["personalityTraits"])} owner of {prospect_persona["business"]}. Respond appropriately to the user\'s last message, staying in character.',
        }


# Main function to determine the next state and generate AI1's prompt
async def determine_next_state_and_prompt(
    conversation_history: List[Dict[str, str]],
    current_state: str,
    prospect_persona: Any,  # Receive the persona as input
) -> Dict[str, str]:
    ai2_prompt = build_ai2_prompt(conversation_history, current_state, prospect_persona)

    try:
        # Call OpenAI API to get AI2's response
        ai2_response = text_openai.ChatCompletion.create(
            model="gpt-4",  # Use 'gpt-4' or another available model
            messages=[{"role": "user", "content": ai2_prompt}],
            max_tokens=500,
            temperature=0.7,
        )

        ai2_output = ai2_response.choices[0].message.content.strip()
        logger.info("AI2 Output: %s", ai2_output)

        # Parse the OpenAI response and return the next state and instructions
        return parse_ai2_response(ai2_output, current_state, prospect_persona)

    except Exception as error:
        logger.error("Error calling OpenAI API for AI2: %s", error)
        # Fallback in case of an API error
        return {
            "nextState": current_state,
            "ai1Instructions": f'You are "{prospect_persona["name"]}", a {", ".join(prospect_persona["personalityTraits"])} owner of {prospect_persona["business"]}. Respond appropriately to the user\'s last message, staying in character.',
        }


# Define the agent
async def entrypoint(ctx: JobContext):
    logger.info("Agent entry function started")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    logger.info(f"Connected to LiveKit room: {ctx.room.name}")

    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    await run_multimodal_agent(ctx, participant)


async def run_multimodal_agent(ctx: JobContext, participant: rtc.RemoteParticipant):
    logger.info("Starting multimodal agent")
    metadata = json.loads(participant.metadata or '{}')
    logger.info("Participant metadata parsed: %s", metadata)

    config = parse_session_config(metadata)
    logger.info(f"Multimodal agent configuration: {config.to_dict()}")

    # Combine alexPrompt with any additional instructions
    combined_instructions = alexPrompt + "\n" + config.instructions

    model = openai.realtime.RealtimeModel(
        api_key=config.openai_api_key,
        instructions=combined_instructions,
        voice=config.voice,
        temperature=config.temperature,
        max_response_output_tokens=config.max_response_output_tokens,
        modalities=config.modalities,
        turn_detection=config.turn_detection,
    )
    logger.info("Realtime model initialized")

    assistant = MultimodalAgent(model=model)
    assistant.start(ctx.room)
    session = model.sessions[0]
    logger.info("Agent session started")

    # Start the conversation
    session.conversation.item.create(
        llm.ChatMessage(
            role="user",
            content="Please begin the interaction with the user in a manner consistent with your instructions.",
        )
    )
    logger.info("Initial conversation item created")
    session.response.create()
    logger.info("Initial response created")

    @ctx.room.on("participant_attributes_changed")
    def on_attributes_changed(
        changed_attributes: dict[str, str], changed_participant: rtc.Participant
    ):
        if changed_participant != participant:
            return

        new_config = parse_session_config(
            {**participant.attributes, **changed_attributes}
        )
        logger.info(
            f"Participant attributes changed: {new_config.to_dict()}, participant: {changed_participant.identity}"
        )
        session.session_update(
            instructions=new_config.instructions,
            voice=new_config.voice,
            temperature=new_config.temperature,
            max_response_output_tokens=new_config.max_response_output_tokens,
            turn_detection=new_config.turn_detection,
            modalities=new_config.modalities,
        )
        logger.info("Session updated with new configuration")

    async def send_transcription(
        ctx: JobContext,
        participant: rtc.Participant,
        track_sid: str,
        segment_id: str,
        text: str,
        is_final: bool = True,
    ):
        transcription = rtc.Transcription(
            participant_identity=participant.identity,
            track_sid=track_sid,
            segments=[
                rtc.TranscriptionSegment(
                    id=segment_id,
                    text=text,
                    start_time=0,
                    end_time=0,
                    language="en",
                    final=is_final,
                )
            ],
        )
        await ctx.room.local_participant.publish_transcription(transcription)
        logger.info("Transcription published: %s", transcription)

    @session.on("response_done")
    async def on_response_done(response: openai.realtime.RealtimeResponse):
        # Log the chat response content
        response_content = "\n".join(
            [
                " ".join([c.text for c in output_item.content])
                for output_item in response.output
            ]
        )

        if response_content:
            logger.info(f'GPT said: "{response_content}"')
            # Track the agent (AI) message in conversation_history
            track_conversation("assistant", response_content)

        message = None

        if response.status == "incomplete":
            if response.status_details and response.status_details.get("reason"):
                reason = response.status_details["reason"]
                logger.error("Response incomplete with reason: %s", reason)
                if reason == "max_output_tokens":
                    message = "🚫 Max output tokens reached"
                elif reason == "content_filter":
                    message = "🚫 Content filter applied"
                else:
                    message = f"🚫 Response incomplete: {reason}"
            else:
                message = "🚫 Response incomplete"
        elif response.status == "failed":
            if response.status_details and response.status_details.get("error"):
                logger.error(
                    "Response failed with error: %s", response.status_details["error"]
                )
                error_code = response.status_details["error"].get("code")
                if error_code == "server_error":
                    message = "⚠️ Server error"
                elif error_code == "rate_limit_exceeded":
                    message = "⚠️ Rate limit exceeded"
                else:
                    message = "⚠️ Response failed"
            else:
                message = "⚠️ Response failed"
        else:
            return

        if message:
            logger.info("Sending transcription with message: %s", message)
            local_participant = ctx.room.local_participant
            track_sid = next(
                (
                    track.sid
                    for track in local_participant.track_publications.values()
                    if track.source == rtc.TrackSource.SOURCE_MICROPHONE
                ),
                None,
            )

            if track_sid:
                await send_transcription(
                    ctx,
                    local_participant,
                    track_sid,
                    "status-" + str(uuid.uuid4()),
                    message,
                )

    @session.on("input_speech_started")
    def on_input_speech_started():
        logger.info("Input speech started")

    @session.on("input_speech_transcription_completed")
    async def on_input_speech_transcription_completed(
        event: openai.realtime.InputTranscriptionCompleted,
    ):
        # Log the transcription text
        transcript_text = event.transcript or ""

        if transcript_text:
            logger.info(f'User said: "{transcript_text}"')
            track_conversation("user", transcript_text)

            logger.info("Fetching next state and instructions")
            result = await determine_next_state_and_prompt(
                conversation_history, current_state, alexPrompt
            )
            next_state = result["nextState"]
            ai1_instructions = result["ai1Instructions"]

            session.session_update(
                instructions=ai1_instructions,
                modalities=["text", "audio"],
            )
            logger.info("Session updated")
            global current_state
            current_state = next_state

            # Generate AI1's next response
            session.response.create()
            logger.info("AI1 generated next response")

    @session.on("input_speech_transcription_failed")
    def on_input_speech_transcription_failed(
        event: openai.realtime.InputTranscriptionFailed,
    ):
        logger.info("Input speech transcription failed: %s", event)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))