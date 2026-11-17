"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { aiApi } from "@/lib/api";

// 19:38:57 jaisa time (reference jaisa)
const now = () => new Date().toLocaleTimeString("en-GB");

// pehle message ke neeche dikhne wale options. Click par ye text AI ko hi jaata hai (fixed jawab nahi)
const WELCOME_OPTIONS = [
  "Total kitni jobs apply ki?",
  "Last applied job kaunsi hai?",
  "Naya application add karna hai",
];

// welcome message function me, taaki close dabane par chat reset ho sake
const welcome = () => ({
  role: "ai",
  isWelcome: true,
  time: now(),
  text: "Hi! Main aapki job applications me madad kar sakta hoon. Please select your choice:",
  options: WELCOME_OPTIONS,
});

// WHAT: pichle 6 messages ko backend ke format me badalta hai.
// WHY: AI ko context chahiye, warna "Indore" jaisa chhota jawab samajh nahi aayega.
// welcome aur error messages history me nahi jaate.
const buildHistory = (msgs) =>
  msgs
    .filter((m) => !m.isWelcome && !m.isError && m.text)
    .slice(-6)
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

// buttons ki styling: stacked (Confirm/Cancel) aur pill (welcome options), reference jaisa
const stackBtn =
  "w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition disabled:opacity-50";
const primaryBtn = `${stackBtn} border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white`;
const mutedBtn = `${stackBtn} border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/5`;
const pillBtn =
  "rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white";

function Avatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-base">
      🤖
    </div>
  );
}

// WHAT: proposal ka summary + Confirm/Cancel buttons (bubble ke andar).
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false); // widget khula hai ya nahi
  const [messages, setMessages] = useState(() => [welcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // naya message aate hi neeche scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  // widget khulte hi input par focus
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // time ke saath message jodna
  const pushMsg = (msg) => setMessages((p) => [...p, { time: now(), ...msg }]);

  // kisi ek proposal (id se) ka status badalna
  const updateAction = (id, patch) =>
    setMessages((prev) =>
      prev.map((m) =>
        m.pendingAction?.id === id ? { ...m, pendingAction: { ...m.pendingAction, ...patch } } : m
      )
    );

  // minimize = sirf chhupao (baatcheet bani rahegi), close = chhupao + chat reset
  const handleClose = () => {
    setOpen(false);
    setMessages([welcome()]);
    setInput("");
  };

  // WHAT: sawal AI ko bhejna. Form aur welcome options dono isi se chalte hain.
  const sendQuestion = async (question) => {
    if (!question || loading) return;

    // history naye message se PEHLE ki baatcheet se banti hai (naya sawal alag bheja jaata hai)
    const history = buildHistory(messages);

    pushMsg({ role: "user", text: question });
    setLoading(true);
    try {
      const res = await aiApi.ask(question, history);
      pushMsg({
        role: "ai",
        text: res.answer,
        // pendingAction ho to bubble ke andar Confirm/Cancel dikhenge
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

  // WHAT: Confirm/Cancel dabane par choice user bubble me dikhta hai, phir bot jawab deta hai.
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
    <>
      {/* launcher button: widget band ho tab dikhta hai */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-2xl text-white shadow-xl transition hover:scale-105"
        >
          🤖
        </button>
      )}

      {/* chat panel. Mobile par poori screen, sm se upar 380x600 ka widget.
          WHY hidden (unmount nahi): minimize par bhi messages state me bane rahein. */}
      <div
        className={`fixed inset-0 z-40 flex-col overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[380px] sm:rounded-2xl ${
          open ? "flex" : "hidden"
        }`}
      >
        {/* header: minimize aur close ke saath */}
        <div className="flex items-center gap-3 bg-[var(--accent)] px-4 py-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">🤖</div>
          <div className="flex-1">
            <p className="font-semibold leading-tight">Job Assistant</p>
            <p className="text-xs text-white/80">Apni applications ke baare me poochho</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Minimize" className="px-1 text-xl leading-none hover:opacity-80">–</button>
          <button onClick={handleClose} aria-label="Close" className="px-1 text-xl leading-none hover:opacity-80">✕</button>
        </div>

        {/* messages */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
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
            ref={inputRef}
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
    </>
  );
}