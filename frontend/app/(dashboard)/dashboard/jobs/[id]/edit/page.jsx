"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import JobForm from "@/components/jobs/JobForm";
import { jobApi } from "@/lib/api";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    jobApi.getById(id).then((res) => setJob(res.data)).catch(console.error);
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await jobApi.update(id, data);
      router.push("/dashboard/jobs");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!job) return <p className="text-[var(--text-secondary)]">Loading...</p>;

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Edit Application</h2>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <JobForm initialData={job} onSubmit={handleUpdate} submitLabel="Save Changes" />
    </div>
  );
}
