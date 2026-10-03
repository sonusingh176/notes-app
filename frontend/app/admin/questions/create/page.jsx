"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionForm from "@/components/admin/QuestionForm";
import { questionApi } from "@/lib/api";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleCreate = async (formData) => {
    try {
      await questionApi.create(formData);
      router.push("/admin/questions");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Create New Question</h3>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <QuestionForm onSubmit={handleCreate} submitLabel="Create Question" />
    </div>
  );
}