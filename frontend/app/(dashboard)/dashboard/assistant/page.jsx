"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { aiApi } from "@/lib/api";

// 19:38:57 jaisa time (reference jaisa)
const now = () => new Date().toLocaleTimeString("en-GB");

// bubble ke andar ke buttons ki styling
// stacked = reference ki right image (poori width, outline)
const stackBtn =
  "w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition disabled:opacity-50";
const primaryBtn = `${stackBtn} border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white`;
const mutedBtn = `${stackBtn} border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5`;
// pill = reference ki left image (chhote gol buttons)
const pillBtn =
  "rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white";

// bot ka gol avatar
function Avatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-base">
      🤖
    </div>
  );
}

// WHAT: AI ke proposal ka summary + Confirm/Cancel buttons (bubble ke andar).
// WHY: preview backend ke data se aata hai, AI ke text se nahi, kyunki AI text me galti kar sakta hai.
function PendingCard({ action, onConfirm, onCancel }) {
  const p = action.preview;
  const busy = action.status === "processing";
  const active = action.status === "pending" || busy; // resolve hone ke baad buttons hat jaate hain

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
          <button onClick={onConfirm} disabled={busy} className={primaryBtn}>
            {busy ? "Saving..." : "✓ Confirm & Save"}
          </button>
          <button onClick={onCancel} disabled={busy} className={mutedBtn}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// pehle message ke options (reference ka "Please select your choice")
const WELCOME_OPTIONS = [
  "Total kitni jobs apply ki?",
  "Last applied job kaunsi hai?",
  "Naya application add karna hai",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      time: now(),
      text: "Hi! Main aapki job applications me madad kar sakta hoon. Please select your choice:",
      options: WELCOME_OPTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // naya message aate hi neeche scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // time ke saath message jodna
  const pushMsg = (msg) => setMessages((p) => [...p, { time: now(), ...msg }]);

  // kisi ek proposal (id se) ka status badalna
  const updateAction = (id, patch) =>
    setMessages((prev) =>
      prev.map((m) =>
        m.pendingAction?.id === id ? { ...m, pendingAction: { ...m.pendingAction, ...patch } } : m
      )
    );

  // form aur welcome options dono isi se sawal bhejte hain
  const sendQuestion = async (question) => {
    if (!question || loading) return;
    pushMsg({ role: "user", text: question });
    setLoading(true);
    try {
      const res = await aiApi.ask(question);
      pushMsg({
        role: "ai",
        text: res.answer,
        pendingAction: res.pendingAction ? { ...res.pendingAction, status: "pending" } : null,
      });
    } catch (err) {
      pushMsg({ role: "ai", text: err.message || "Something went wrong.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = input.trim();
    setInput("");
    sendQuestion(q);
  };

  // WHAT: Confirm ya Cancel dabane par. Choice user bubble me dikhta hai, phir bot jawab deta hai.
  const handleAction = async (id, type) => {
    updateAction(id, { status: "processing" });
    pushMsg({ role: "user", text: type === "confirm" ? "Confirm" : "Cancel" });
    try {
      await aiApi[type](id); // aiApi.confirm(id) ya aiApi.cancel(id)
      updateAction(id, { status: "done" });
      pushMsg(
        type === "confirm"
          ? { role: "ai", text: "✓ Application save ho gayi.", showJobsLink: true }
          : { role: "ai", text: "Theek hai, cancel kar diya." }
      );
    } catch (err) {
      // 404 = expire ho gaya ya pehle hi use ho chuka, dobara try bekaar. Baaki errors me retry theek hai.
      updateAction(id, { status: err.status === 404 ? "done" : "pending" });
      pushMsg({ role: "ai", text: err.message || "Kuch gadbad hui.", isError: true });
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg">
      {/* header */}
      <div className="flex items-center gap-3 bg-[var(--accent)] px-4 py-3 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">🤖</div>
        <div>
          <p className="font-semibold leading-tight">Job Assistant</p>
          <p className="text-xs text-white/80">Apni applications ke baare me poochho</p>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex flex-col items-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--accent)] px-4 py-2 text-sm text-white">
                {m.text}
              </div>
              <span className="mt-1 text-[11px] text-[var(--text-secondary)]">{m.time}</span>
            </div>
          ) : (
            <div key={i} className="flex gap-2">
              <Avatar />
              <div className="min-w-0 max-w-[85%]">
                <p className="mb-1 text-xs text-[var(--text-secondary)]">Job Assistant</p>
                <div
                  className={`rounded-2xl rounded-tl-sm border px-4 py-2.5 text-sm ${
                    m.isError
                      ? "border-red-500/40 text-red-400"
                      : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {m.showJobsLink && (
                    <Link href="/dashboard/jobs" className="mt-2 inline-block text-[var(--accent)] underline">
                      View jobs
                    </Link>
                  )}

                  {/* welcome options: sirf tab tak jab tak user ne kuch bheja nahi */}
                  {m.options && messages.length === 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.options.map((opt) => (
                        <button key={opt} onClick={() => sendQuestion(opt)} className={pillBtn}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.pendingAction && (
                    <PendingCard
                      action={m.pendingAction}
                      onConfirm={() => handleAction(m.pendingAction.id, "confirm")}
                      onCancel={() => handleAction(m.pendingAction.id, "cancel")}
                    />
                  )}
                </div>
                <p className="mt-1 text-right text-[11px] text-[var(--text-secondary)]">{m.time}</p>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2">
            <Avatar />
            <span className="animate-pulse text-sm text-[var(--text-secondary)]">typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder="Enter your message"
          className="flex-1 border-b border-[var(--border)] bg-transparent py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="text-xl text-[var(--accent)] disabled:opacity-40"
        >
          ➤
        </button>
      </form>
    </div>
  );
}