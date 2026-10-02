"use client";

import { useRouter } from "next/navigation";
import QuestionForm from "@/components/admin/QuestionForm";

// Naya question create karne wala page.
export default function CreateQuestionPage() {
  const router = useRouter();

  const handleCreate = (formData) => {
    console.log("Creating question (dummy):", formData);
    // TODO (Phase 4): real API call yahan aayega
    router.push("/admin/questions");
  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Create New Question</h3>
      <QuestionForm onSubmit={handleCreate} submitLabel="Create Question" />
    </div>
  );
}
