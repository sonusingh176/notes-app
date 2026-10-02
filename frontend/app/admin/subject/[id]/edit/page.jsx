"use client";

import { useRouter, useParams } from "next/navigation";
import TopicForm from "@/components/admin/TopicForm";
import { dummyTopics } from "@/lib/dummy-data";

// Topic edit karne wala page.
// NOTE: Next.js 15+/16 me page ka `params` prop ek Promise hota hai (server components ke liye).
// Client component me sabse simple tarika "useParams()" hook hai — isiliye yahan
// directly props.params use nahi kiya, useParams() use kiya hai (sync, koi await nahi chahiye).
export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams(); // { id: "1" }

  // dummy data se matching topic dhoondo
  const topic = dummyTopics.find((t) => t.id === params.id);

  if (!topic) {
    return <p className="text-gray-400">Topic not found.</p>;
  }

  const handleUpdate = (formData) => {
    console.log("Updating topic (dummy):", params.id, formData);
    // TODO (Phase 4): real API call (PUT/PATCH) yahan aayega
    router.push("/admin/topics");
  };

  return (
    <div>
      <h3 className="mb-6 text-lg font-semibold text-white">Edit Topic</h3>
      <TopicForm initialData={topic} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
