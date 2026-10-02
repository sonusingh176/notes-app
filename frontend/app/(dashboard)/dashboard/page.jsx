"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { jobApi } from "@/lib/api";

const statusColors = {
  applied: "bg-blue-500/15 text-blue-400",
  interview_scheduled: "bg-yellow-500/15 text-yellow-400",
  interview_completed: "bg-purple-500/15 text-purple-400",
  offered: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  withdrawn: "bg-gray-500/15 text-gray-400",
};

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobApi.getAll()
      .then((res) => setJobs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = jobs.length;
  const offered = jobs.filter((j) => j.currentStatus === "offered").length;
  const interviews = jobs.filter((j) =>
    ["interview_scheduled", "interview_completed"].includes(j.currentStatus)
  ).length;
  const rejected = jobs.filter((j) => j.currentStatus === "rejected").length;

  const recent = [...jobs]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Here's your job application summary.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Applied" value={loading ? "—" : total} icon="📋" />
        <StatCard label="Interviews" value={loading ? "—" : interviews} icon="🗓️" />
        <StatCard label="Offers" value={loading ? "—" : offered} icon="🎉" />
        <StatCard label="Rejected" value={loading ? "—" : rejected} icon="❌" />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Recent Applications</h3>
          <Link href="/dashboard/jobs" className="text-sm text-[var(--accent)] hover:underline">View all</Link>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
        ) : recent.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[var(--text-secondary)]">No applications yet.</p>
            <Link
              href="/dashboard/jobs/create"
              className="mt-3 inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              + Add First Application
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((job) => (
              <div key={job._id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{job.companyName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{job.role}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[job.currentStatus]}`}>
                  {job.currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
