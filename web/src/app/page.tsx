import { Header } from "@/components/header";
import { RoomComponent } from "@/components/room-component";
import { Auth } from "@/components/auth";
import LK from "@/components/lk";
import Heart from "@/assets/heart.svg";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100"> {/* Use min-h-screen for proper height handling */}
      <header className="flex flex-shrink-0 h-12 items-center justify-between px-4 w-full md:mx-auto">
        <LK />
        <Auth />
      </header>
      
      <main className="flex flex-col flex-grow overflow-auto p-0 md:p-2 md:pt-0 w-full md:mx-auto"> {/* Allow scrolling */}
        <Header />
        <RoomComponent />
      </main>
      
      <footer className="hidden md:flex md:items-center md:gap-2 md:justify-end font-mono uppercase text-right pt-1 pb-2 px-8 text-xs text-gray-600 w-full md:mx-auto">
        Built with
        <Heart />
        by
        <a
          href="https://voltairelabs.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Voltaire Labs
        </a>{" "}
        •
        {/* <a
          href="https://github.com/livekit-examples/realtime-playground"
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-1"
        >
          <GitHubLogoIcon className="h-4 w-4" />
          View source on GitHub
        </a> */}
        • © 2024 Rekbot AI
      </footer>
    </div>
  );
}