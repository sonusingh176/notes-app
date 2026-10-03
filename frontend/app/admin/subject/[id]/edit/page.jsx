"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TopicForm from "@/components/admin/TopicForm";
import { subjectApi } from "@/lib/api";

export default function EditSubjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // getAll se filter karke milayenge kyunki getById route nahi hai
    subjectApi.getAll()
      .then((res) => {
        const found = res.subjects.find((s) => s._id === id);
        setSubject(found);
      })
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      await subjectApi.update(id, formData);
      router.push("/admin/subject");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!subject) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Edit Subject</h3>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <TopicForm initialData={subject} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}