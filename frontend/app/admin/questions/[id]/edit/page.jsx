"use client";

import { useRouter, useParams } from "next/navigation";
import QuestionForm from "@/components/admin/QuestionForm";
import { dummyQuestions } from "@/lib/dummy-data";

// Question edit karne wala page (Topics edit page jaisa hi pattern, useParams() use kiya hai).
export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams(); // { id: "101" }

  const question = dummyQuestions.find((q) => q.id === params.id);

  if (!question) {
    return <p className="text-gray-400">Question not found.</p>;
  }

  const handleUpdate = (formData) => {
    console.log("Updating question (dummy):", params.id, formData);
    // TODO (Phase 4): real API call (PUT/PATCH) yahan aayega
    router.push("/admin/questions");
  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Edit Question</h3>
      <QuestionForm initialData={question} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
