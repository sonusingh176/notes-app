"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import {
  BookOpen,
  MousePointer2,
  ChevronRight,
  X,
} from "lucide-react";

export default function SubjectSection() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    publicApi
      .getSubjects()
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
    setQuestions([]);
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

  const closeSubject = () => {
    setActiveSubject(null);
    setQuestions([]);
  };

  if (loading) {
    return (
      <section className="w-full px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#f97316]" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Subject Pills */}
      <div className="flex flex-wrap justify-center gap-3 px-4 sm:px-6 lg:px-8">
        {subjects.map((subject) => {
          const isActive = activeSubject?._id === subject._id;

          return (
            <button
              key={subject._id}
              onClick={() => handleSubjectClick(subject)}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-[#f59e0b] bg-gradient-to-r from-[#f97316]/20 to-[#fbbf24]/15 text-[#fbbf24] shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]"
                  : "border-white/15 bg-[#13192b] text-gray-300 hover:border-[#f97316]/50 hover:text-white"
              }`}
            >
              <span>{subject.icon || "📁"}</span>
              {subject.name}
            </button>
          );
        })}
      </div>

      {/* Default State */}
      {!activeSubject && subjects.length > 0 && (
       <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#f59e0b]/20 bg-gradient-to-r from-[#13192b] via-[#181f33] to-[#1b2231] p-6 mx-4 sm:mx-6 sm:flex-row sm:p-10 lg:mx-8"> 
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#f59e0b]/25 bg-gradient-to-br from-[#f97316]/15 to-[#fbbf24]/15 text-[#fbbf24]">
              <BookOpen size={32} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white">
                Ready to test your knowledge?
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
                Choose a subject and start practicing questions with answers.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 bg-gradient-to-r from-[#f97316] to-[#fbbf24] bg-clip-text text-sm font-semibold text-transparent">
            <MousePointer2 size={18} className="text-[#f97316]" />
            Select a subject
          </div>
        </div>
      )}

      {/* Empty Subjects */}
      {subjects.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#13192b] px-6 py-16 text-center">
          <BookOpen className="mx-auto mb-4 text-[#f59e0b]/60" size={36} />

          <h3 className="text-lg font-semibold text-white">
            No subjects available
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Choose a subject and start practicing questions with answers.
          </p>
        </div>
      )}

      {/* Questions Card */}
      {activeSubject && (
        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-[#f59e0b]/25 bg-[#13192b] shadow-xl">
          {/* Questions Header */}
          <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-[#1b2231] via-[#212536] to-[#1b2231] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#f59e0b]/25 bg-gradient-to-br from-[#f97316]/20 to-[#fbbf24]/15 text-2xl">
                {activeSubject.icon || "📁"}
              </div>

              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white sm:text-xl">
                  {activeSubject.name}
                </h3>

                <p className="mt-1 text-sm font-medium text-[#fbbf24]/90">
                  {qLoading
                    ? "Loading questions..."
                    : `${questions.length} ${
                        questions.length === 1 ? "Question" : "Questions"
                      }`}
                </p>

                {activeSubject.description && (
                  <p className="mt-2 text-sm text-gray-400">
                    {activeSubject.description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={closeSubject}
              aria-label="Close questions"
              className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full text-gray-400 transition hover:bg-[#f97316]/15 hover:text-[#fbbf24] sm:self-center"
            >
              <X size={20} />
            </button>
          </div>

          {/* Questions List */}
          <div className="p-3 sm:p-5">
            {qLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/10 border-t-[#f97316]" />
              </div>
            ) : questions.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen
                  size={32}
                  className="mx-auto mb-3 text-[#f59e0b]/60"
                />

                <p className="text-sm text-gray-400">
                  No questions available for this subject yet.
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionItem
                    key={question._id}
                    index={index + 1}
                    question={question}
                  />
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
    <li className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-[#f59e0b]/30">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-white/[0.03] sm:p-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f59e0b]/20 bg-gradient-to-br from-[#f97316]/15 to-[#fbbf24]/15 text-sm font-semibold text-[#fbbf24]">
          {index}
        </span>

        <span className="flex-1 text-sm font-medium leading-relaxed text-gray-100 sm:text-base">
          {question.questionText}
        </span>

        <span
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            open
              ? "border-[#f59e0b]/40 bg-gradient-to-r from-[#f97316]/15 to-[#fbbf24]/15 text-[#fbbf24]"
              : "border-white/10 text-gray-400"
          }`}
        >
          {open ? "Hide" : "Answer"}

          <ChevronRight
            size={14}
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 py-5 sm:px-5">
          <div className="flex gap-3 rounded-xl border border-[#f59e0b]/15 bg-gradient-to-r from-[#f97316]/[0.05] to-[#fbbf24]/[0.03] p-4 sm:p-5">
            <div className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#f97316] to-[#fbbf24]" />

            <p className="text-sm leading-7 text-gray-300 sm:text-base">
              {question.answer || "No answer available yet."}
            </p>
          </div>
        </div>
      )}
    </li>
  );
}