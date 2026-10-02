"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBox from "@/components/admin/SearchBox";
import QuestionTable from "@/components/admin/QuestionTable";
import DeleteDialog from "@/components/admin/DeleteDialog";
import { dummyQuestions } from "@/lib/dummy-data";

// Questions list page — search + delete dummy data ke saath (Topics page jaisa pattern).
export default function QuestionsPage() {
  const [questions, setQuestions] = useState(dummyQuestions);
  const [search, setSearch] = useState("");
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.topicTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmDelete = () => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete.id));
    setQuestionToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search questions..." />

        <Link
          href="/admin/questions/create"
          className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New Question
        </Link>
      </div>

      <QuestionTable questions={filteredQuestions} onDeleteClick={setQuestionToDelete} />

      <DeleteDialog
        open={!!questionToDelete}
        itemName={questionToDelete?.question}
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
}
