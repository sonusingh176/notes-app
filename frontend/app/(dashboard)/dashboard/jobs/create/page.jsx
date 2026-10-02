"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import { jobApi } from "@/lib/api";

export default function CreateJobPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleCreate = async (data) => {
    try {
      await jobApi.create(data);
      router.push("/dashboard/jobs");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Add Job Application</h2>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <JobForm onSubmit={handleCreate} submitLabel="Add Application" />
    </div>
  );
}
