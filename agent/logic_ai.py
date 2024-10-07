import os
import json
import logging
import openai  # Import OpenAI (instead of from openai import OpenAI)
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client with API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def build_ai2_prompt(conversation_history, current_state, prospect_persona):
    """Build the AI2 prompt for OpenAI API."""
    
    # Construct the conversation history outside of the f-string
    conversation_history_str = ''.join([f"{entry['role']}: {entry['content']}\n" for entry in conversation_history])
    
    # Now, build the full prompt
    prompt = f"""
You are an assistant that manages the state of a sales conversation using the Straight Line Selling method.

Prospect Persona:
{json.dumps(prospect_persona, indent=2)}

Conversation History:
{conversation_history_str}

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
    return prompt


def parse_ai2_response(response_content, current_state, prospect_persona):
    """Parse the OpenAI response and return the next state and instructions."""
    try:
        parsed_output = json.loads(response_content)
        logger.info('*********** Summary: %s', parsed_output)
        return {
            'nextState': parsed_output.get('nextState', current_state),
            'ai1Instructions': parsed_output.get('ai1Instructions', ''),
        }
    except json.JSONDecodeError as error:
        logger.error('Error parsing AI2 response: %s', error)
        # Fallback to current state and default instructions
        return {
            'nextState': current_state,
            'ai1Instructions': f'You are "{prospect_persona["name"]}", a {", ".join(prospect_persona["personalityTraits"])} owner of {prospect_persona["business"]}. Respond appropriately to the user\'s last message, staying in character.',
        }

async def determine_next_state_and_prompt(conversation_history, current_state, prospect_persona):
    """Determine the next state and generate AI1's prompt."""
    ai2_prompt = build_ai2_prompt(conversation_history, current_state, prospect_persona)

    try:
        # Call OpenAI API to get AI2's response
        ai2_response = await openai.ChatCompletion.create(
            model='gpt-4',  # Use 'gpt-4' or another available model
            messages=[{'role': 'user', 'content': ai2_prompt}],
            max_tokens=500,
            temperature=0.7,
        )

        ai2_output = ai2_response['choices'][0]['message']['content'].strip() if ai2_response['choices'] else ''
        logger.info('AI2 Output: %s', ai2_output)

        # Parse the OpenAI response and return the next state and instructions
        return parse_ai2_response(ai2_output, current_state, prospect_persona)

    except Exception as error:
        logger.error('Error calling OpenAI API for AI2: %s', error)
        # Fallback in case of an API error
        return {
            'nextState': current_state,
            'ai1Instructions': f'You are "{prospect_persona["name"]}", a {", ".join(prospect_persona["personalityTraits"])} owner of {prospect_persona["business"]}. Respond appropriately to the user\'s last message, staying in character.',
        }
