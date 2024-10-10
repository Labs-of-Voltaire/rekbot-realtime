import { OpenAI } from "openai";

export async function POST(request: Request) {
  const { transcript, instructions }: { transcript: string; instructions: string } = await request.json();
  const openaiAPIKey = process.env.OPENAI_API_KEY;

  if (!openaiAPIKey) {
    throw new Error("OPENAI_API_KEY must be set");
  }

  // Initialize OpenAI client
  const openai = new OpenAI();

  // Create the prompt for assessing the transcript based on the instructions and straight-line selling method
  const prompt = `
    You are tasked with assessing only the cold caller in a cold call conversation. Below is a cold call transcript followed by specific persona instructions. Do not assess the prospect or their responses—your focus is entirely on the performance of the cold caller.
    Your task is to evaluate the conversation based on the straight-line selling method and provide a JSON report.

    **Transcript**: 
    ${transcript}

    **Instructions**: 
    ${instructions}

    **Assessment Criteria**:
    Provide a JSON report containing metrics for:
    - Clarity of speech
    - Tonality (engagement and enthusiasm)
    - Confidence
    - Control (keeping the conversation on track)
    - Level of certainty (did the speaker sound sure?)
    - Level of rapport building with the client
    - Handling objections (was the speaker able to handle objections effectively?)
    - Persuasiveness (how convincing was the speaker?)
    - Closing Skills (ability to drive the conversation towards a conclusion)

    Additionally, identify phrases or sections of the transcript where the speaker could have improved. 
    For each identified phrase, provide a suggestion of what the speaker should have said instead.

    **Return the report in the following JSON format**:
    {
      "clarity": "rating out of 10",
      "tonality": "rating out of 10",
      "confidence": "rating out of 10",
      "control": "rating out of 10",
      "certainty": "rating out of 10",
      "rapport_building": "rating out of 10",
      "objection_handling": "rating out of 10",
      "persuasiveness": "rating out of 10",
      "closing_skills": "rating out of 10",
      "prospect_said_goodbye": "return true if the prospect has explicitly said the word "Goodbye" and nothing else",
      "phrases_to_improve": [
        {
          "original_phrase": "phrase of the cold caller from the transcript",
          "suggested_improvement": "better way to say it"
        }
      ],
      "summary": "brief summary of overall assessment"
    }
  `;

  console.log("transcript", transcript);
  // console.log("instructions", instructions);

  try {
    // Call OpenAI API with the generated prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "system", content: "Provide a detailed assessment of the conversation." },
      ],
      max_tokens: 700, // Adjust token limit if needed
      temperature: 0.7,
    });

    const assessment = completion.choices[0].message.content?.trim();
    console.log("assessment", assessment);

    let response;
    try {
      response = assessment && JSON.parse(assessment);
    } catch (error) {
      response = {
        error: "Failed to parse JSON response from OpenAI API",
        raw_response: assessment,
      };
    }

    // Return the JSON report as a response
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error during OpenAI API call", error);
    return new Response(JSON.stringify({ error: "Failed to generate report" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}