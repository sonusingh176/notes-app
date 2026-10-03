"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBox from "@/components/admin/SearchBox";
import QuestionTable from "@/components/admin/QuestionTable";
import DeleteDialog from "@/components/admin/DeleteDialog";
import { questionApi } from "@/lib/api";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    questionApi.getAll()
      .then((res) => setQuestions(res.questions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase()) ||
    q.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    try {
      await questionApi.delete(questionToDelete._id);
      setQuestions((prev) => prev.filter((q) => q._id !== questionToDelete._id));
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionToDelete(null);
    }
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

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <QuestionTable questions={filteredQuestions} onDeleteClick={setQuestionToDelete} />
      )}

      <DeleteDialog
        open={!!questionToDelete}
        itemName={questionToDelete?.questionText}
        onConfirm={handleConfirmDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
}