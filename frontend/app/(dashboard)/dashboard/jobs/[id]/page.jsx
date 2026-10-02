"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";

const statusColors = {
  applied: "bg-blue-500/15 text-blue-400",
  interview_scheduled: "bg-yellow-500/15 text-yellow-400",
  interview_completed: "bg-purple-500/15 text-purple-400",
  offered: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  withdrawn: "bg-gray-500/15 text-gray-400",
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">{label}</p>
      <p className="text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobApi.getById(id)
      .then((res) => setJob(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[var(--text-secondary)]">Loading...</p>;
  if (!job) return <p className="text-red-400">Job not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{job.companyName}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{job.role}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[job.currentStatus]}`}>
          {job.currentStatus.replace(/_/g, " ")}
        </span>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 grid grid-cols-2 gap-5">
        <Field label="Location" value={job.location} />
        <Field label="Work Mode" value={job.workMode} />
        <Field label="Tech Stack" value={job.tech} />
        <Field label="Source" value={job.source} />
        <Field label="HR Email" value={job.email} />
        <Field label="Applied Date" value={new Date(job.appliedDate).toLocaleDateString()} />
        {job.jobPostingUrl && (
          <div className="col-span-2">
            <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Job Posting</p>
            <a href={job.jobPostingUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)] text-sm hover:underline">
              {job.jobPostingUrl}
            </a>
          </div>
        )}
        {job.notes && (
          <div className="col-span-2">
            <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Notes</p>
            <p className="text-sm text-[var(--text-primary)]">{job.notes}</p>
          </div>
        )}
      </div>

      {job.statusHistory?.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Status History</h3>
          <div className="space-y-3">
            {job.statusHistory.map((h, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[h.status]}`}>
                  {h.status.replace(/_/g, " ")}
                </span>
                <p className="text-xs text-[var(--text-secondary)] flex-1">{h.note}</p>
                <p className="text-xs text-[var(--text-secondary)] shrink-0">{new Date(h.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => router.back()} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5">
          ← Back
        </button>
        <button onClick={() => router.push(`/dashboard/jobs/${id}/edit`)} className="rounded-lg bg-gradient-to-r from-indigo-600 to-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">
          Edit
        </button>
      </div>
    </div>
  );
}
