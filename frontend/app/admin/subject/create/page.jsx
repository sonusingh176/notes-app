"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopicForm from "@/components/admin/TopicForm";
import { subjectApi } from "@/lib/api";

// Naya subject create karne wala page.
// Abhi backend nahi hai, isliye sirf console.log karke list page pe wapas bhej rahe hain.
// Jab API ready ho, yahan ek fetch('/api/topics', { method: 'POST', ... }) call aayega.
export default function CreateTopicPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleCreate = async (formData) => {
    console.log("Creating topic (dummy):", formData);
    // TODO (Phase 4): real API call yahan aayega

    try {
      await subjectApi.create(formData);
      
    router.push("/admin/subject");
    } catch (err) {
      console.log(err)
      setError(err.message || "Something went wrong");
    }

  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Create New Subject</h3>
       {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <TopicForm onSubmit={handleCreate} submitLabel="Create Subject" />
     
    </div>
  );
}
