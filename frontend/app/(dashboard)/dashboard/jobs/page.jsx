"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { jobApi } from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";

const statusColors = {
  applied: "bg-blue-500/15 text-blue-400",
  interview_scheduled: "bg-yellow-500/15 text-yellow-400",
  interview_completed: "bg-purple-500/15 text-purple-400",
  offered: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
  withdrawn: "bg-gray-500/15 text-gray-400",
};

const columns = (handleDelete) => [
  {
    header: "Company", accessorKey: "companyName", sortable: true,
    render: (row) => <span className="font-medium text-[var(--text-primary)]">{row.companyName}</span>,
  },
  { header: "Role", accessorKey: "role", sortable: true },
  { header: "Location", accessorKey: "location" },
  {
    header: "Status", accessorKey: "currentStatus",
    render: (row) => (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[row.currentStatus]}`}>
        {row.currentStatus.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    header: "Applied", accessorKey: "appliedDate",
    render: (row) => new Date(row.appliedDate).toLocaleDateString(),
  },
  {
    header: "Actions", key: "actions",
    render: (row) => (
      <div className="flex gap-3">
        <Link href={`/dashboard/jobs/${row._id}`} className="text-sm text-blue-400 hover:underline">View</Link>
        <Link href={`/dashboard/jobs/${row._id}/edit`} className="text-sm text-[var(--accent)] hover:underline">Edit</Link>
        <button onClick={() => handleDelete(row._id)} className="text-sm text-red-400 hover:underline">Delete</button>
      </div>
    ),
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobApi.getAll()
      .then((res) => setJobs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this application?")) return;
    await jobApi.delete(id);
    setJobs((prev) => prev.filter((j) => j._id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Job Applications</h2>
        <Link
          href="/dashboard/jobs/create"
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          + Add Application
        </Link>
      </div>
      <DataTable
        columns={columns(handleDelete)}
        rows={jobs}
        loading={loading}
        searchPlaceholder="Search company, role..."
        emptyMessage="No job applications found."
      />
    </div>
  );
}
