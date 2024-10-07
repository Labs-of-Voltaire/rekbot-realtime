import OpenAI from 'openai';
import logger from './logger'; // Import your logger
import { JobContext } from '@livekit/agents';
import * as openai from "@livekit/agents-plugin-openai";
import "dotenv/config";

const textOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to build the AI2 prompt
function buildAi2Prompt(
  conversationHistory: { role: string; content: string }[],
  currentState: string,
  prospectPersona: any // Receive the persona as input
): string {
  return `
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
  "summary": "1 line summary of the instructions."
}

Do not include any additional text outside of the JSON format.
`;
}

// Function to parse the OpenAI response
function parseAi2Response(responseContent: string, currentState: string, prospectPersona: any): { nextState: string; ai1Instructions: string } {
  try {
    const parsedOutput = JSON.parse(responseContent);
    logger.info('*********** Summary', parsedOutput);
    return {
      nextState: parsedOutput.nextState || currentState,
      ai1Instructions: parsedOutput.ai1Instructions || '',
    };
  } catch (error) {
    logger.error('Error parsing AI2 response:', error);
    // Fallback to current state and default instructions
    return {
      nextState: currentState,
      ai1Instructions: `You are "${prospectPersona.name}", a ${prospectPersona.personalityTraits.join(', ')} owner of ${
        prospectPersona.business
      }. Respond appropriately to the user's last message, staying in character.`,
    };
  }
}

// Main function to determine the next state and generate AI1's prompt
export async function determineNextStateAndPrompt(
  conversationHistory: { role: string; content: string }[],
  currentState: string,
  prospectPersona: any // Receive the persona as input
): Promise<{ nextState: string; ai1Instructions: string }> {
  const ai2Prompt = buildAi2Prompt(conversationHistory, currentState, prospectPersona);

  try {
    // Call OpenAI API to get AI2's response
    const ai2Response = await textOpenAI.chat.completions.create({
      model: 'gpt-4', // Use 'gpt-4' or another available model
      messages: [{ role: 'user', content: ai2Prompt }],
      max_tokens: 500,
      temperature: 0.7,
    //   stop: ['\n\n'],
    });

    const ai2Output = ai2Response.choices[0]?.message?.content?.trim() || '';
    logger.info('AI2 Output:', ai2Response);
    logger.info('AI2 Output:', ai2Output);

    // Parse the OpenAI response and return the next state and instructions
    return parseAi2Response(ai2Output, currentState, prospectPersona);

  } catch (error) {
    logger.error('Error calling OpenAI API for AI2:', error);
    // Fallback in case of an API error
    return {
      nextState: currentState,
      ai1Instructions: `You are "${prospectPersona.name}", a ${prospectPersona.personalityTraits.join(', ')} owner of ${
        prospectPersona.business
      }. Respond appropriately to the user's last message, staying in character.`,
    };
  }
}
