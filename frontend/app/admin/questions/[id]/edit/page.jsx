"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import QuestionForm from "@/components/admin/QuestionForm";
import { questionApi } from "@/lib/api";

export default function EditQuestionPage() {
  const router = useRouter();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    questionApi.getAll()
      .then((res) => {
        const found = res.questions.find((q) => q._id === id);
        setQuestion(found);
      })
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await questionApi.update(id, formData);
      router.push("/admin/questions");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!question) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Edit Question</h3>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <QuestionForm initialData={question} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}