import asyncio
import json
import logging
import os
import uuid
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Tuple

from livekit import rtc
from livekit.agents import JobContext, WorkerOptions, cli, multimodal
from livekit.agents import llm
from livekit.plugins import openai
from dotenv import load_dotenv

from utils import parse_session_config, get_microphone_track_sid  # Import helper functions
from logic_ai import determine_next_state_and_prompt  # Import AI state management logic
from prompt import alexPrompt

# Load environment variables from a .env file
load_dotenv()

# Initialize logger
logger = logging.getLogger("agent")
logger.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)

# Add console handler to logger
logger.addHandler(console_handler)
logger.propagate = True  # Ensure messages are propagated to the root logger

# Example log message
logger.info("Logger initialized")

# Create a list to track the conversation history
conversation_history: List[Dict[str, str]] = []
current_state = "Initial Contact"

# Function to track the conversation
def track_conversation(role: str, content: str):
    conversation_history.append({"role": role, "content": content})

async def entry(ctx: JobContext):
    logger.info("Agent entry function started")
    await ctx.connect()
    logger.info("Connected to LiveKit room")

    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")
    
    await run_multimodal_agent(ctx, participant)

async def run_multimodal_agent(ctx: JobContext, participant: rtc.Participant):
    logger.info("Starting multimodal agent")
    
    metadata = json.loads(participant.metadata)
    logger.info("Participant metadata parsed: %s", metadata)

    # Use the helper function from utils.py to parse session config
    config = parse_session_config(metadata)
    #config['turnDetection'].pop('threshold', None)
    logger.info(f"Multimodal agent configuration: {config}")
    logger.info(f"alexPrompt: {alexPrompt}")

    model = openai.realtime.RealtimeModel(
        api_key=config['openaiApiKey'],  # Adjust key naming based on utils.py
        instructions=". ".join([alexPrompt, config['instructions']]),
        voice=config['voice'],
        temperature=config['temperature'],
        max_response_output_tokens=config['maxOutputTokens'],
        modalities=config['modalities'],
        turn_detection=config['turnDetection'],
    )
    
    logger.info("Realtime model initialized")

    agent = multimodal.MultimodalAgent(model=model)
    logger.info("Multimodal agent instance created")
    logger.info(f"model prompt: {agent._model.__dict__}")

    session = await agent.start(ctx.room)
    logger.info("Agent session started")

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
    def on_attributes_changed(changed_attributes: Dict[str, str], changed_participant: rtc.Participant):
        if changed_participant != participant:
            return
        logger.info(f"Participant attributes changed for {changed_participant.identity}: %s", changed_attributes)
        
        new_config = parse_session_config({**participant.attributes, **changed_attributes})
        logger.info("New configuration after attribute change: %s", new_config)

        session.session_update(
            instructions=new_config['instructions'],
            temperature=new_config['temperature'],
            max_response_output_tokens=new_config['maxOutputTokens'],
            modalities=new_config['modalities'],
            turn_detection=new_config['turnDetection'],
        )
        logger.info("Session updated with new configuration")

    async def send_transcription(ctx: JobContext, participant: rtc.Participant, track_sid: str, segment_id: str, text: str, is_final: bool = True):
        try:
            transcription = rtc.Transcription(
                participant_identity=participant.identity,
                track_sid=track_sid,
                segments=[rtc.TranscriptionSegment(
                    id=segment_id,
                    text=text,
                    start_time=0,
                    end_time=0,
                    language="",
                    final=is_final,
                )],
            )
            await ctx.room.local_participant.publish_transcription(transcription)
            logger.info("Transcription published: %s", transcription)
        except Exception as e:
            logger.error("Error publishing transcription: %s", e)

    @session.on("response_done")
    def on_response_done(response: openai.realtime.RealtimeResponse):
        response_content = "\n".join([output.content[0].text for output in response.output]) if response.output else ""
        logger.info("on_response_done callback triggered")
        if response_content:
            logger.info(f'GPT said: "{response_content}"')
            track_conversation("assistant", response_content)

        message = None
        if response.status == "incomplete":
            logger.error("Response incomplete with reason: %s", response.status_details.get("reason", "Unknown"))
            message = "🚫 Response incomplete"
        elif response.status == "failed":
            logger.error("Response failed with error: %s", response.status_details.get("error", "Unknown"))
            message = "⚠️ Response failed"

        if message:
            logger.info("Sending transcription with message: %s", message)
            local_participant = ctx.room.local_participant
            track_sid = get_microphone_track_sid(local_participant)

            if track_sid:
                asyncio.create_task(send_transcription(ctx, local_participant, track_sid, f"status-{uuid.uuid4()}", message))

    @session.on("input_speech_started")
    def on_input_speech_started():
        logger.info("Input speech started")

    @session.on("input_speech_transcription_completed")
    async def on_input_speech_transcription_completed(event: openai.realtime.InputSpeechTranscriptionCompleted):
        transcript_text = event.transcript or ""
        if transcript_text:
            logger.info(f'User said: "{transcript_text}"')
            track_conversation("user", transcript_text)

        # Use logic-ai's state management function
        logger.info("Fetching next state and instructions")
        next_state, ai_instructions = await determine_next_state_and_prompt(conversation_history, current_state, metadata)
        
        session.session_update(
            instructions=ai_instructions,
            modalities=["text", "audio"]
        )
        logger.info(f"Session updated with next state: {next_state}")

    @session.on("input_speech_transcription_failed")
    def on_input_speech_transcription_failed(event):
        logger.error("Input speech transcription failed: %s", event)

if __name__ == "__main__":
    agent_path = os.path.realpath(__file__)
    print("Running agent with the following settings:")
    print(f"Agent file path: {agent_path}")
    print(f"API Key: {os.getenv('LIVEKIT_API_KEY')}")
    print(f"API Secret: {os.getenv('LIVEKIT_API_SECRET')}")
    print(f"WebSocket URL: {os.getenv('LIVEKIT_URL')}")

    options = WorkerOptions(
        entrypoint_fnc=entry,
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
        ws_url=os.getenv("LIVEKIT_URL"),
    )

    cli.run_app(options)
