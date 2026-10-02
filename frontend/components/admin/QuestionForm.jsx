"use client";

import { useState } from "react";
import { dummyTopics } from "@/lib/dummy-data";

// Shared form — Create aur Edit, dono pages isi ko use karenge.
//
// Props:
//   initialData -> { topicId, question, answer, difficulty } (optional)
//   onSubmit     -> form submit hone par chalega, formData object ke saath
//   submitLabel  -> button ka text
export default function QuestionForm({ initialData = {}, onSubmit, submitLabel = "Save" }) {
  const [form, setForm] = useState({
    topicId: initialData.topicId || dummyTopics[0]?.id || "",
    question: initialData.question || "",
    answer: initialData.answer || "",
    difficulty: initialData.difficulty || "Easy",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-300">Topic</label>
        <select
          value={form.topicId}
          onChange={handleChange("topicId")}
          required
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        >
          {dummyTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.icon} {topic.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Question</label>
        <textarea
          value={form.question}
          onChange={handleChange("question")}
          required
          rows={2}
          placeholder="e.g. What is a closure in JavaScript?"
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Answer</label>
        <textarea
          value={form.answer}
          onChange={handleChange("answer")}
          required
          rows={5}
          placeholder="Write the answer here..."
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Difficulty</label>
        <select
          value={form.difficulty}
          onChange={handleChange("difficulty")}
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-6 py-2.5 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
