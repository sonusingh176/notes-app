"use client";

import { useState,useEffect } from "react";
import { subjectApi } from "@/lib/api";

// Shared form — Create aur Edit, dono pages isi ko use karenge.
//
// Props:
//   initialData -> { topicId, question, answer, difficulty } (optional)
//   onSubmit     -> form submit hone par chalega, formData object ke saath
//   submitLabel  -> button ka text
export default function QuestionForm({ initialData = {}, onSubmit, submitLabel = "Save" }) {
  
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
  subjectApi.getAll().then((res) => setSubjects(res.subjects));
}, []);

  // form state me:
const [form, setForm] = useState({
  topicId: initialData.subject?._id || initialData.subject || "",
  questionText: initialData.questionText || "",   // question → questionText
  answer: initialData.answer || "",
  status: initialData.status || "active",
  // difficulty nahi hai backend model me — hata do
});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, subject: form.topicId })
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
       <option value="">-- Select Subject --</option>
{subjects.map((s) => (
  <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Question</label>
        <textarea
         value={form.questionText}
onChange={handleChange("questionText")}
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


      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-6 py-2.5 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
