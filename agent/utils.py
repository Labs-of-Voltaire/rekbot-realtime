import os
import json
import logging
from typing import Union, List, Dict, Optional, Any

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define types
class TurnDetection:
    def __init__(self, type: str, threshold: Optional[float] = None, 
                 prefix_padding_ms: Optional[int] = None, 
                 silence_duration_ms: Optional[int] = None):
        self.type = type
        self.threshold = threshold
        self.prefix_padding_ms = prefix_padding_ms
        self.silence_duration_ms = silence_duration_ms

    def to_dict(self):
        return {
            "type": self.type,
            "threshold": self.threshold,
            "prefix_padding_ms": self.prefix_padding_ms,
            "silence_duration_ms": self.silence_duration_ms,
        }

TurnDetectionType = TurnDetection  # Change from dict to the class
SessionConfig = Dict[str, Union[str, float, Optional[int], List[str], Optional[TurnDetectionType]]]

def safe_log_config(config: SessionConfig) -> str:
    """Log session configuration safely by redacting sensitive information."""
    safe_config = {**config, 'openaiApiKey': '[REDACTED]'}  # Redacting sensitive info
    return json.dumps(safe_config)

def parse_session_config(data: Any) -> SessionConfig:
    """Parse the session configuration from the provided data."""
    logger.info("Parsing session configuration from data: %s", data)

    # Parse turn detection from the data if it exists
    turn_detection_data = json.loads(data.get('turn_detection', '{}')) if data.get('turn_detection') else None
    turn_detection = None
    
    logger.info(f'Turn Data: {turn_detection_data}')
    
    if turn_detection_data:
        turn_detection = TurnDetection(
            type=turn_detection_data.get('type', 'server_vad'),  # Default to 'server_vad'
            threshold=turn_detection_data.get('threshold'),
            prefix_padding_ms=turn_detection_data.get('prefix_padding_ms'),
            silence_duration_ms=turn_detection_data.get('silence_duration_ms'),
        )

    # Parse data, handling defaults and None values
    config: SessionConfig = {
        'openaiApiKey': os.getenv('OPENAI_API_KEY', ''),  # Load OpenAI API key from environment variables
        'instructions': data.get('instructions', ''),
        'voice': data.get('voice', ''),
        'temperature': float(data.get('temperature', '0.8')),
        'maxOutputTokens': float('inf') if data.get('max_output_tokens') == 'inf' else (
            int(data.get('max_output_tokens', 0)) if data.get('max_output_tokens') is not None else 0),  # Ensure valid default
        'modalities': modalities_from_string(data.get('modalities', 'text_and_audio')),
        'turnDetection': turn_detection,
    }

    return config

def modalities_from_string(modalities: str) -> List[str]:
    """Convert modality string to a list of modalities."""
    modalities_map: Dict[str, List[str]] = {
        'text_and_audio': ['text', 'audio'],
        'text_only': ['text'],
    }
    return modalities_map.get(modalities, ['text', 'audio'])

def get_microphone_track_sid(participant: Any) -> Optional[str]:
    """Get the microphone track SID for the participant."""
    logger.info("Getting microphone track SID for participant: %s", participant['identity'])
    track_sid = next(
        (track['sid'] for track in participant['trackPublications'].values() if track['source'] == 'SOURCE_MICROPHONE'),
        None
    )
    logger.info("Microphone track SID: %s", track_sid)
    return track_sid
