from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from dataclasses import asdict, dataclass
from typing import Any, Dict
from analysis_prompt import analysis_prompt
from prompt import alexPrompt
from pydantic import BaseModel
from openai import AsyncOpenAI
from private.params import credentials

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

logger = logging.getLogger("my-worker")
logger.setLevel(logging.INFO)

new_instructions = None

@dataclass
class SessionConfig:
    openai_api_key: str
    instructions: str
    voice: openai.realtime.api_proto.Voice
    temperature: float 
    max_response_output_tokens: str | int
    modalities: list[openai.realtime.api_proto.Modality]
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
        openai_api_key=data.get("openai_api_key", ""),
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


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    run_multimodal_agent(ctx, participant)

    logger.info("agent started")


def run_multimodal_agent(ctx: JobContext, participant: rtc.Participant):
    metadata = json.loads(participant.metadata)
    config = parse_session_config(metadata)
    logger.info(f"starting omni assistant with config: {config.to_dict()}")
    conversation_history = []
    model = openai.realtime.RealtimeModel(
        api_key=os.getenv("OPENAI_API_KEY"),
        instructions=config.instructions,
        voice=config.voice,
        temperature=config.temperature,
        max_response_output_tokens=config.max_response_output_tokens,
        modalities=config.modalities,
        turn_detection=config.turn_detection,
    )
    assistant = MultimodalAgent(model=model)
    assistant.start(ctx.room)
    session = model.sessions[0]

    if config.modalities == ["text", "audio"]:
        session.conversation.item.create(
            llm.ChatMessage(
                role="user",
                content="Please begin the interaction with the user in a manner consistent with your instructions.",
            )
        )
        session.response.create()

    @ctx.room.on("participant_attributes_changed")
    def on_attributes_changed(
        changed_attributes: dict[str, str], changed_participant: rtc.Participant
    ):
        if changed_participant == participant:
            return
        
        new_config = parse_session_config(
            {**participant.attributes, **changed_attributes}
        )
        
         # Use the new instructions if they were generated
        if new_instructions:
            instructions_to_use = new_instructions
        else:
            instructions_to_use = config.instructions  # Fallback to original instructions

        
        logger.info(f"participant attributes changed: {new_config.to_dict()}, participant: {changed_participant.identity}")
        session = model.sessions[0]
        session.session_update(
            instructions=instructions_to_use,
            voice=new_config.voice,
            temperature=new_config.temperature,
            max_response_output_tokens=new_config.max_response_output_tokens,
            turn_detection=new_config.turn_detection,
            modalities=new_config.modalities,
        )

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

    @session.on("response_done")
    def on_response_done(response: openai.realtime.RealtimeResponse):
        message = None
        user_message = None
        if response.status == "incomplete":
            if response.status_details and response.status_details['reason']:
                reason = response.status_details['reason']
                if reason == "max_output_tokens":
                    message = "🚫 Max output tokens reached"
                elif reason == "content_filter":
                    message = "🚫 Content filter applied"
                else:
                    message = f"🚫 Response incomplete: {reason}"
            else:
                message = "🚫 Response incomplete"
        elif response.status == "failed":
            if response.status_details and response.status_details['error']:
                error_code = response.status_details['error']['code']
                if error_code == "server_error":
                    message = "⚠️ Server error"
                elif error_code == "rate_limit_exceeded":
                    message = "⚠️ Rate limit exceeded"
                else:
                    message = "⚠️ Response failed"
            else:
                message = "⚠️ Response failed"
        else:
            conversation_history.append({'role': 'assistant', 'content': response.output[0].content[0].text})

        local_participant = ctx.room.local_participant
        track_sid = next(
            (
                track.sid
                for track in local_participant.track_publications.values()
                if track.source == rtc.TrackSource.SOURCE_MICROPHONE
            ),
            None,
        )

        asyncio.create_task(
            send_transcription(
                ctx, local_participant, track_sid, "status-" + str(uuid.uuid4()), message
            )
        )

    last_transcript_id = None

    # send three dots when the user starts talking. will be cleared later when a real transcription is sent.
    @session.on("input_speech_started")
    def on_input_speech_started():
        nonlocal last_transcript_id
        remote_participant = next(iter(ctx.room.remote_participants.values()), None)
        if not remote_participant:
            return

        track_sid = next(
            (
                track.sid
                for track in remote_participant.track_publications.values()
                if track.source == rtc.TrackSource.SOURCE_MICROPHONE
            ),
            None,
        )
        if last_transcript_id:
            asyncio.create_task(
                send_transcription(
                    ctx, remote_participant, track_sid, last_transcript_id, ""
                )
            )

        new_id = str(uuid.uuid4())
        last_transcript_id = new_id
        asyncio.create_task(
            send_transcription(
                ctx, remote_participant, track_sid, new_id, "…", is_final=False
            )
        )

    @session.on("input_speech_transcription_completed")
    def on_input_speech_transcription_completed(
    event: openai.realtime.InputTranscriptionCompleted,
    ):
        nonlocal last_transcript_id
        if last_transcript_id:
            remote_participant = next(iter(ctx.room.remote_participants.values()), None)
            if not remote_participant:
                return

            track_sid = next(
                (
                    track.sid
                    for track in remote_participant.track_publications.values()
                    if track.source == rtc.TrackSource.SOURCE_MICROPHONE
                ),
                None,
            )
            
            conversation_history.append({'role': 'user', 'content': event.transcript})
            
            asyncio.create_task(analyze_conversation(conversation_history, session))
            
            asyncio.create_task(
                send_transcription(
                    ctx, remote_participant, track_sid, last_transcript_id, ""
                )
            )
            last_transcript_id = None

    @session.on("input_speech_transcription_failed")
    def on_input_speech_transcription_failed(
        event: openai.realtime.InputTranscriptionFailed,
    ):
        nonlocal last_transcript_id
        if last_transcript_id:
            remote_participant = next(iter(ctx.room.remote_participants.values()), None)
            if not remote_participant:
                return

            track_sid = next(
                (
                    track.sid
                    for track in remote_participant.track_publications.values()
                    if track.source == rtc.TrackSource.SOURCE_MICROPHONE
                ),
                None,
            )
            
            transcription_text = event.text
            
            conversation_history.append(f"User: {transcription_text}")

            error_message = "⚠️ Transcription failed"
            asyncio.create_task(
                send_transcription(
                    ctx,
                    remote_participant,
                    track_sid,
                    last_transcript_id,
                    error_message,
                )
            )
            last_transcript_id = None

    #-----------------------------------------------------------------------------------------
    async def analyze_conversation(conversation_history: list[str], session) -> bool:
        client = AsyncOpenAI(api_key=credentials['OpenAI-Key'])
        
        global new_instructions

        class scoreConversation(BaseModel):
            rapport: int
            value_demonstrating: int
            objection_handling: int
            conciseness: int
            straight_line_selling: int
            overall_performance_score: int
            
        combined_analysis_prompt = (
            ". ".join([analysis_prompt, str(conversation_history)])
        )

        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": combined_analysis_prompt},
                    {"role": "user", "content": "Analyse the conversation"}
                ],
                response_format=scoreConversation,
            )

            message = completion.choices[0].message

            if message.parsed:
                # Log the score analysis
                logger.info(
                    f'rapport: {message.parsed.rapport}\n'
                    f'Value Demonstrating: {message.parsed.value_demonstrating}\n'
                    f'Objection Handling: {message.parsed.objection_handling}\n'
                    f'Straight Line Selling: {message.parsed.straight_line_selling}\n'
                    f'Conciseness: {message.parsed.conciseness}\n'
                    f'Overall Score: {message.parsed.overall_performance_score}'
                )
                
                new_instructions = await update_system_prompt(session, message.parsed.overall_performance_score)

        except Exception as e:
            logger.error(f"Error during conversation analysis: {e}")


    async def update_system_prompt(session, performance_score: int):
        # Define thresholds for behavior change
        if performance_score >= 7:
            new_instructions = alexPrompt("Be very polite and encouraging to the user.")
        elif performance_score >= 5:
            new_instructions = alexPrompt("Be neutral and professional in your responses.")
        else:
            new_instructions = alexPrompt("be very dismissive and rude.")

        # Log the change in instructions
        logger.info(f"Updating system prompt to: {new_instructions}")

        # Update the session with new instructions
        session.session_update(
            instructions=new_instructions,
            # You can keep the other parameters the same or modify them as needed
        )
        
        return new_instructions
#-----------------------------------------------------------------------------------------


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))
