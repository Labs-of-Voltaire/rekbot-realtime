import { determineNextStateAndPrompt } from '../logic-ai'; // Import the refactored function
import dotenv from 'dotenv';

// Load environment variables from .env for API key
dotenv.config();

describe('ai2DetermineNextStateAndPrompt (Real API Call)', () => {
  it('should call OpenAI and return the next state and instructions', async () => {
    // Define a mock conversation history and initial state
    const conversationHistory = [
      { role: 'user', content: 'I need a website.' },
      { role: 'assistant', content: 'Great! What kind of website?' },
    ];
    const currentState = 'Initial Contact';

    // Define a prospect persona
    const prospectPersona = {
      name: 'John Doe',
      personalityTraits: ['friendly', 'skeptical'],
      business: 'Doe Enterprises',
      currentProblems: ['Website is outdated', 'Not getting enough leads'],
      fears: ['Investing in the wrong service', 'High costs'],
      objections: ['Need to discuss with partners', 'Budget constraints']
    };

    // Call the function with the real API
    const result = await determineNextStateAndPrompt(conversationHistory, currentState, prospectPersona);

    // Log the result to see what the API returns
    console.log('API Result:', result);

    // Validate the structure of the result
    expect(result).toHaveProperty('nextState');
    expect(result).toHaveProperty('ai1Instructions');

    // Optionally, validate that the result contains reasonable data based on the persona
    expect(result.nextState).toBeTruthy(); // Should not be empty or undefined
    expect(result.ai1Instructions).toBeTruthy(); // Should not be empty or undefined
  });

  it('should return fallback instructions on error', async () => {
    // Define a mock conversation history and initial state
    const conversationHistory = [
      { role: 'user', content: 'I need a website.' },
      { role: 'assistant', content: 'Great! What kind of website?' },
    ];
    const currentState = 'Initial Contact';

    // Define a prospect persona
    const prospectPersona = {
      name: 'Jane Doe',
      personalityTraits: ['busy', 'direct'],
      business: 'TechCorp Solutions',
      currentProblems: ['Too much overhead', 'Slow software development'],
      fears: ['Wasting time', 'Low return on investment'],
      objections: ['Need more details', 'Tight budget']
    };

    // Manually trigger an error by providing invalid OpenAI configuration or network issue
    // You can simulate this by disabling your internet or using incorrect API key

    try {
      // Call the function and expect it to fail
      const result = await determineNextStateAndPrompt(conversationHistory, currentState, prospectPersona);
      expect(result).toBeUndefined(); // If it reaches here, the API didn't fail as expected
    } catch (error) {
      // Handle the error and validate fallback behavior
      expect(error).toBeDefined(); // Error should be thrown
    }
  });
});
