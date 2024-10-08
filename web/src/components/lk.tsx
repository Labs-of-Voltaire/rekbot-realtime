"use client";

import Logo from "@/assets/lk.svg";

export default function LK() {
  return (
    <a
      href="https://rekbot.ai"
      className="hover:opacity-70 transition-all duration-250 flex items-center gap-2 mt-6"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Logo />
    </a>
  );
}
