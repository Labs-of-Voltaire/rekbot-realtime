"use client";

import Logo from "@/assets/lk.svg";

export default function LK() {
  return (
    <a
      href="#"
      className="hover:opacity-70 transition-all duration-250 flex items-center gap-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Logo width="40" />
      <h2>Rekbot AI</h2>
    </a>
  );
}
