"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, X } from "lucide-react";

import { aiApi } from "@/lib/api";

// welcome message ke neeche ke options. Click par ye text seedha AI ko jaata hai (fixed jawab nahi)
const WELCOME_OPTIONS = [
  "Total kitni jobs apply ki?",
  "Last applied job kaunsi hai?",
  "Naya application add karna hai",
];

const welcomeMessage = () => ({
  id: 1,
  role: "assistant",
  content: "Hi! How can I help you?",
  options: WELCOME_OPTIONS,
  isWelcome: true,
});

// WHAT: pichle 6 messages backend ke format me.
// WHY: AI ko context chahiye, warna "Indore" jaisa chhota jawab samajh nahi aayega.
// welcome aur error messages history me nahi jaate.
const buildHistory = (msgs) =>
  msgs
    .filter((m) => !m.isWelcome && !m.isError && m.content)
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content }));

// button styles: pill (welcome options) aur stacked (Confirm/Cancel), reference jaisa
const pillBtn =
  "rounded-md border border-[var(--accent)] px-3 py-1.5 text-xs text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white";
const stackBtn =
  "w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition disabled:opacity-50";
const confirmBtn = `${stackBtn} border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white`;
const cancelBtn = `${stackBtn} border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5`;

// WHAT: AI ke proposal ka summary + Confirm/Cancel buttons (bubble ke andar).
// WHY: summary backend ke data se aati hai, AI ke text se nahi, kyunki AI text me galti kar sakta hai.
function PendingCard({ action, onConfirm, onCancel }) {
  const p = action.preview;
  const busy = action.status === "processing";
  const active = action.status === "pending" || busy; // resolve hote hi buttons hat jaate hain

  return (
    <div className="mt-3 border-t border-[var(--border)] pt-3">
      <div className="space-y-0.5 text-[var(--text-secondary)]">
        <p>Company: <span className="text-[var(--text-primary)]">{p.companyName}</span></p>
        <p>Role: <span className="text-[var(--text-primary)]">{p.role}</span></p>
        <p>Location: <span className="text-[var(--text-primary)]">{p.location}</span></p>
        <p>Work mode: <span className="text-[var(--text-primary)]">{p.workMode}</span></p>
        <p>Applied: <span className="text-[var(--text-primary)]">{new Date(p.appliedDate).toLocaleDateString()}</span></p>
      </div>

      {active && (
        <div className="mt-3 space-y-2">
          <button type="button" onClick={onConfirm} disabled={busy} className={confirmBtn}>
            {busy ? "Saving..." : "✓ Confirm & Save"}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className={cancelBtn}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatbotWindow({ onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => [welcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);

  const nextId = useRef(2); // welcome ki id 1 hai
  const bottomRef = useRef(null);

  // naya message aate hi neeche scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // WHY id updater ke bahar: React dev me updater 2 baar chala sakta hai
  const addMessage = (msg) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, ...msg }]);
  };

  // kisi ek proposal (id se) ka status badalna
  const updateAction = (id, patch) =>
    setMessages((prev) =>
      prev.map((m) =>
        m.pendingAction?.id === id
          ? { ...m, pendingAction: { ...m.pendingAction, ...patch } }
          : m
      )
    );

  // WHAT: sawal AI ko bhejna. Form aur welcome options dono isi se chalte hain.
  const sendQuestion = async (text) => {
    if (!text || isLoading) return;

    // history naye message se PEHLE ki baatcheet se banti hai
    const history = buildHistory(messages);

    addMessage({ role: "user", content: text });
    setIsLoading(true);

    try {
      const response = await aiApi.ask(text, history);
      addMessage({
        role: "assistant",
        content:
          response?.answer ||
          (response?.pendingAction
            ? "Maine ye application taiyaar kiya hai. Review karke Confirm dabao."
            : "I couldn't generate an answer."),
        // pendingAction ho to bubble ke andar Confirm/Cancel dikhenge
        pendingAction: response?.pendingAction
          ? { ...response.pendingAction, status: "pending" }
          : null,
      });
    } catch (error) {
      console.error("AI Assistant Error:", error);
      addMessage({
        role: "assistant",
        content: error?.message || "Something went wrong. Please try again.",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setMessage("");
    sendQuestion(text);
  };

  // WHAT: Confirm/Cancel dabane par choice user bubble me dikhta hai, phir bot jawab deta hai.
  const handleAction = async (id, type) => {
    updateAction(id, { status: "processing" });
    addMessage({ role: "user", content: type === "confirm" ? "Confirm" : "Cancel" });

    try {
      await aiApi[type](id); // aiApi.confirm(id) ya aiApi.cancel(id)
      updateAction(id, { status: "done" });
      addMessage(
        type === "confirm"
          ? { role: "assistant", content: "✓ Application save ho gayi.", showJobsLink: true }
          : { role: "assistant", content: "Theek hai, cancel kar diya." }
      );
    } catch (error) {
      // 404 = expire ho gaya ya pehle hi use ho chuka, dobara try bekaar. Baaki errors me retry theek hai.
      updateAction(id, { status: error?.status === 404 ? "done" : "pending" });
      addMessage({
        role: "assistant",
        content: error?.message || "Kuch gadbad hui. Dobara try karo.",
        isError: true,
      });
    }
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
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">AI Assistant</h2>
            <p className="text-xs text-[var(--text-secondary)]">Ask about your job applications</p>
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
            className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
                item.role === "user"
                  ? "rounded-br-md bg-[var(--accent)] text-white"
                  : item.isError
                  ? "rounded-bl-md border border-red-500/40 bg-[var(--bg-card)] text-red-400"
                  : "rounded-bl-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
              }`}
            >
              <p className="whitespace-pre-wrap">{item.content}</p>

              {item.showJobsLink && (
                <Link href="/dashboard/jobs" className="mt-2 inline-block text-[var(--accent)] underline">
                  View jobs
                </Link>
              )}

              {/* welcome options: sirf tab tak jab tak user ne kuch bheja nahi */}
              {item.options && messages.length === 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={isLoading}
                      onClick={() => sendQuestion(option)}
                      className={pillBtn}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {item.pendingAction && (
                <PendingCard
                  action={item.pendingAction}
                  onConfirm={() => handleAction(item.pendingAction.id, "confirm")}
                  onCancel={() => handleAction(item.pendingAction.id, "cancel")}
                />
              )}
            </div>
          </div>
        ))}

        {/* Loading message */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <span>Thinking</span>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
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
            maxLength={300}
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!message.trim() || isLoading}
          >
            <Send size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}