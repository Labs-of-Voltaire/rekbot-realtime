"use client";

import { Chat } from "@/components/chat";
import { Transcript } from "@/components/transcript";
import { AgentProvider } from "@/hooks/use-agent";
import { useConnection } from "@/hooks/use-connection";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { ChevronDown } from "lucide-react"; // Icons for collapse/expand
import { useRef, useState } from "react";

export function RoomComponent() {
  const { shouldConnect, wsUrl, token } = useConnection();
  // const [isCollapsed, setIsCollapsed] = useState(true); // State to toggle configuration visibility
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={shouldConnect}
      audio={true}
      className="flex flex-col flex-grow overflow-scroll border-l border-r border-b rounded-b-md"
      style={{ "--lk-bg": "white" } as React.CSSProperties}
    >
      <AgentProvider>
        {/* Main grid layout for TranscriptAnalysis and Transcript */}
        {/* <div className="flex-grow md:grid md:grid-cols-[480px_1fr_360px] lg:grid-cols-[480px_1fr_360px] xl:grid-cols-[480px_1fr_360px] overflow-scroll"> */}
        {/* <div className="flex-grow md:grid md:grid-cols-[480px_1fr] lg:grid-cols-[480px_1fr] xl:grid-cols-[480px_1fr] overflow-scroll"> */}
        <div className="flex-grow grid grid-cols-2 overflow-scroll">
          {/* Left area for ConfigurationForm and TranscriptAnalysis 
          <div className="flex flex-col h-full overflow-y-auto relative border-r">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center p-2 bg-gray-100 hover:bg-gray-200 transition-colors w-full"
            >
              <span className="flex-grow text-left font-semibold">
                {isCollapsed ? "Show Configuration" : "Hide Configuration"}
              </span>
              {isCollapsed ? <ChevronDown /> : <ChevronUp />}
            </button>

            {!isCollapsed && (
              <div className="transition-all duration-300">
                <ConfigurationForm />
              </div>
            )}

            <div className="transition-all duration-300 mt-4">
              <TranscriptAnalysis />
            </div> 
          </div>
          */}

          {/* Center Chat area */}
          <div className="flex flex-col justify-center w-full max-w-3xl mx-auto">
            <Chat />
          </div>

          {/* Right area for Transcript */}
          <div className="flex flex-col h-full overflow-y-auto relative border-l">
            <div className="flex-grow overflow-y-auto" ref={transcriptContainerRef}>
              <Transcript
                scrollContainerRef={transcriptContainerRef}
                scrollButtonRef={scrollButtonRef}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button
                ref={scrollButtonRef}
                className="p-2 bg-white text-gray-500 rounded-full hover:bg-gray-100 transition-colors absolute right-4 bottom-4 shadow-md flex items-center"
              >
                <ChevronDown className="mr-1 h-4 w-4" />
                <span className="text-xs pr-1">View latest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Microphone controls */}
        <div className="w-full border-t p-4 bg-white">
          <RoomAudioRenderer />
          <StartAudio label="Click to allow audio playback" />
        </div>
      </AgentProvider>
    </LiveKitRoom>
  );
}