"use client";

import { useState } from "react";
import { Bot, Send, X } from "lucide-react";

/*
 * Basic chat window.
 *
 * For now this is UI-only. The send button adds the user's message and
 * shows a small placeholder response. In the next step we can connect
 * this component to POST /ai/ask through the existing Axios client.
 */
export default function ChatbotWindow({ onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! How can I help you?",
    },
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const text = message.trim();
    if (!text) return;

    // Add the user's message to the chat.
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        content: text,
      },
    ]);

    setMessage("");

    // Temporary response until the backend AI API is connected.
    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I received your message. AI integration will be connected next.",
        },
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex h-[min(600px,calc(100vh-3rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Bot size={20} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              AI Assistant
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Ask about your job applications
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI Assistant"
          className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
        >
          <X size={19} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`flex ${
              item.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                item.role === "user"
                  ? "rounded-br-md bg-[var(--accent)] text-white"
                  : "rounded-bl-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
              }`}
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--border)] bg-[var(--bg-card)] p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1.5">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask something..."
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />

          <button
            type="submit"
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
