"use client";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";

// Accordion — ek question ka expand/collapse
function QuestionAccordion({ question }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:bg-white/5 transition"
      >
        <span>{question.questionText}</span>
        <span className="ml-4 shrink-0 text-[#b480ff]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-4 text-sm text-gray-300 leading-relaxed">
          {question.answer}
        </div>
      )}
    </div>
  );
}

// Subject card — click karne par questions load honge
function SubjectCard({ subject }) {
  const [expanded, setExpanded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleToggle = async () => {
    setExpanded((p) => !p);

    // Questions sirf ek baar fetch karo
    if (!fetched) {
      setLoading(true);
      try {
        const res = await publicApi.getQuestions(subject._id);
        setQuestions(res.questions || []);
        setFetched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#1b2231] overflow-hidden">
      {/* Subject header — click karne par toggle */}
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between p-5 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{subject.icon || "📁"}</span>
          <div className="text-left">
            <p className="font-semibold text-white">{subject.name}</p>
            {subject.description && (
              <p className="text-xs text-gray-400 mt-0.5">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {subject.questionCount !== undefined && (
            <span className="text-xs text-gray-400">{subject.questionCount} questions</span>
          )}
          <span className="text-[#b480ff]">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Questions accordion */}
      {expanded && (
        <div className="border-t border-white/10">
          {loading ? (
            <p className="px-5 py-4 text-sm text-gray-400">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">No questions yet.</p>
          ) : (
            questions.map((q) => (
              <QuestionAccordion key={q._id} question={q} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Main section
export default function SubjectsSection() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getSubjects()
      .then((res) => setSubjects(res.subjects || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="mb-2 text-center text-3xl font-bold text-white">
        Browse by <span className="text-[#b480ff]">Topic</span>
      </h2>
      <p className="mb-10 text-center text-sm text-gray-400">
        Click any topic to see all interview questions.
      </p>

      {loading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#b480ff]" />
        </div>
      ) : subjects.length === 0 ? (
        <p className="text-center text-gray-400">No subjects added yet.</p>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject._id} subject={subject} />
          ))}
        </div>
      )}
    </section>
  );
}