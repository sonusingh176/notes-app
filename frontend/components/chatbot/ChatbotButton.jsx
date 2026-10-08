"use client";

import { Bot } from "lucide-react";

/*
 * Small floating button shown at the bottom-right of the screen.
 * The parent component decides what should happen when it is clicked.
 */
export default function ChatbotButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open AI Assistant"
      className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]"
    >
      <Bot size={26} strokeWidth={2} />
    </button>
  );
}
