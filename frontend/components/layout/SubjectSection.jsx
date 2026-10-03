"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";

export default function SubjectSection() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    publicApi.getSubjects()
      .then((res) => setSubjects(res.subjects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectClick = async (subject) => {
    if (activeSubject?._id === subject._id) {
      setActiveSubject(null);
      setQuestions([]);
      return;
    }
    setActiveSubject(subject);
    setQLoading(true);
    try {
      const res = await publicApi.getQuestions(subject._id);
      setQuestions(res.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setQLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#b480ff]" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 pb-20">
      {/* Pill buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {subjects.map((subject) => {
          const isActive = activeSubject?._id === subject._id;
          return (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-[#b480ff] bg-[#b480ff]/15 text-[#b480ff]"
                  : "border-white/15 text-gray-300 hover:border-white/30 hover:text-white"
              }`}
            >
              <span>{subject.icon || "📁"}</span>
              {subject.name}
            </button>
          );
        })}
        {subjects.length === 0 && (
          <p className="text-sm text-gray-400">No subjects added yet.</p>
        )}
      </div>

      {/* Questions card */}
      {activeSubject && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#13192b] shadow-2xl animate-[fadeIn_0.2s_ease]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1b2231] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b480ff]/15 text-xl">
                {activeSubject.icon || "📁"}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg leading-tight">
                  {questions.length} {activeSubject.name} Interview Questions
                </h3>
                {activeSubject.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{activeSubject.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => { setActiveSubject(null); setQuestions([]); }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* Questions list */}
          <div className="px-2 py-2">
            {qLoading ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/10 border-t-[#b480ff]" />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No questions yet.</p>
            ) : (
              <ol>
                {questions.map((q, i) => (
                  <QuestionItem key={q._id} index={i + 1} question={q} />
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function QuestionItem({ index, question }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-white/5 transition rounded-lg"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs text-gray-400">
          {index}
        </span>
        <span className="flex-1 text-sm text-gray-100">{question.questionText}</span>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
            open
              ? "border-[#b480ff] bg-[#b480ff]/15 text-[#b480ff]"
              : "border-white/15 text-gray-400"
          }`}
        >
          {open ? "Hide" : "Answer"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pl-13">
          <div className="ml-9 rounded-lg bg-white/5 px-4 py-3 text-sm leading-relaxed text-gray-300">
            {question.answer}
          </div>
        </div>
      )}
    </li>
  );
}