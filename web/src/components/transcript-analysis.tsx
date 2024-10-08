import { useEffect, useState } from "react";
import { useAgent } from "@/hooks/use-agent";
import { usePlaygroundState } from "@/hooks/use-playground-state";

const Dial = ({ label, value }: { label: string; value: number }) => {
  const radius = 24; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle
  const offset = circumference - (value / 10) * circumference; // Stroke offset based on value out of 10

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex justify-center items-center w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#e5e7eb" // Gray background circle
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#3498db" // Blue stroke (fill color)
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }} // Smooth transition for the fill
          />
        </svg>
        <div className="absolute flex justify-center items-center w-full h-full">
          <span className="text-sm font-semibold">{value}/10</span>
        </div>
      </div>
      <div className="text-center mt-2 text-sm font-semibold">{label}</div>
    </div>
  );
};

export function TranscriptAnalysis() {
  const { displayTranscriptions } = useAgent();
  const { pgState } = usePlaygroundState(); // Access playground state
  const [transcript, setTranscript] = useState<string>("");
  const [assessment, setAssessment] = useState<any>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastWordThreshold, setLastWordThreshold] = useState<number>(0);
  const [softError, setSoftError] = useState<string | null>(null); // Handle soft errors

  const instructions = pgState.instructions; // Fetch instructions from the playground state

  // Count the number of words in a given text
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  // Build the structured transcript showing who said what
  const buildTranscript = (transcriptions: any[]) => {
    return transcriptions
      .map(({ segment, participant }: any) => {
        const speaker = participant.isAgent ? "The Cold Caller said" : "The Prospect said";
        return `${speaker}: "${segment.text.trim()}"\n`;
      })
      .join(" ");
  };

  // Fetch transcript data and update word count
  useEffect(() => {
    if (displayTranscriptions.length > 0) {
      const structuredTranscript = buildTranscript(displayTranscriptions);
      setTranscript(structuredTranscript);

      const totalWordCount = countWords(structuredTranscript);
      setWordCount(totalWordCount);
    }
  }, [displayTranscriptions]);

  // Trigger analysis based on word thresholds
  useEffect(() => {
    if (wordCount >= 50 && wordCount - lastWordThreshold >= 10) {
      fetchResults(transcript, instructions); // Pass instructions to the API call
      setLastWordThreshold(wordCount); // Update the threshold after each analysis
    }
  }, [wordCount]);

  const fetchResults = async (transcript: string, instructions: string) => {
    console.log("Sending transcript and instructions to /results: ", { transcript, instructions });

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript, instructions }), // Include instructions in the API call
      });

      console.log("API Response Status: ", response.status);

      const data = await response.json();

      // Handle incomplete JSON response gracefully
      if (!data || !data.summary || !data.phrases_to_improve) {
        setSoftError("Incomplete data received from the analysis API.");
        return; // Don't update the assessment if it's incomplete
      }

      console.log("Assessment Data: ", data);
      setAssessment(data);
      setSoftError(null); // Reset the soft error if data is good
    } catch (err) {
      console.error("Error fetching assessment results: ", err);
      setSoftError("An error occurred while fetching analysis. Retrying...");
      setError("Error fetching assessment results");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Realtime Report</h2>

      {softError && <div className="text-yellow-600">{softError}</div>} {/* Soft error */}

      {error && <div className="text-red-500">{error}</div>}

      {/* Dials with metrics */}
      {assessment && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Dial label="Clarity" value={assessment.clarity} />
          <Dial label="Tonality" value={assessment.tonality} />
          <Dial label="Confidence" value={assessment.confidence} />
          <Dial label="Control" value={assessment.control} />
          <Dial label="Certainty" value={assessment.certainty} />
          <Dial label="Rapport Building" value={assessment.rapport_building} />
          <Dial label="Objection Handling" value={assessment.objection_handling} />
          <Dial label="Persuasiveness" value={assessment.persuasiveness} /> {/* New Dial */}
          <Dial label="Closing Skills" value={assessment.closing_skills} /> {/* New Dial */}
        </div>
      )}

      {/* Summary */}
      {assessment && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Summary</h3>
          <p className="text-sm">{assessment.summary}</p>
        </div>
      )}

      {/* Improved Phrases */}
      {assessment && assessment.phrases_to_improve.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Suggested Phrase Improvements</h3>
          <ul className="list-disc list-inside">
            {assessment.phrases_to_improve.map((phrase: any, index: number) => (
              <li key={index}>
                <strong>Original:</strong> {phrase.original_phrase}
                <br />
                <strong>Suggested:</strong> {phrase.suggested_improvement}
                <br />
                <br />
                </li>
            ))}
          </ul>
        </div>
      )}

      {/* {!assessment && !error && <div>Loading assessment...</div>} */}
      {wordCount < 50 && <div>Keep talking to generate a detailed analysis...</div>}
    </div>
  );
}