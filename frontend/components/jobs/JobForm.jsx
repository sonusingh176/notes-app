"use client";
import { useState, useEffect } from "react";
import { jobApi } from "@/lib/api";
const WORK_MODES = ["remote", "onsite", "hybrid"];
const SOURCES = ["LinkedIn", "Naukri", "Indeed", "Company Website", "Referral", "Other"];

export default function JobForm({ initialData = {}, onSubmit, submitLabel = "Save" }) {
  const [statuses, setStatuses] = useState([]);

  const [form, setForm] = useState({
    companyName: initialData.companyName || "",
    role: initialData.role || "",
    email: initialData.email || "",
    tech: initialData.tech || "",
    jobPostingUrl: initialData.jobPostingUrl || "",
    location: initialData.location || "",
    workMode: initialData.workMode || "onsite",
    source: initialData.source || "",
    appliedDate: initialData.appliedDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    notes: initialData.notes || "",
    currentStatus: initialData.currentStatus || "", 
  });

  useEffect(() => {
    jobApi.getStatuses().then((res) => setStatuses(res.data));
  }, []);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const inputClass = "w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-300">Company Name *</label>
          <input value={form.companyName} onChange={set("companyName")} required className={inputClass} placeholder="e.g. Google" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Role *</label>
          <input value={form.role} onChange={set("role")} required className={inputClass} placeholder="e.g. Frontend Developer" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-300">Location *</label>
          <input value={form.location} onChange={set("location")} required className={inputClass} placeholder="e.g. Indore / Remote" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Work Mode</label>
          <select value={form.workMode} onChange={set("workMode")} className={inputClass}>
            {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-300">Tech Stack</label>
          <input value={form.tech} onChange={set("tech")} className={inputClass} placeholder="e.g. MERN, Laravel" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-300">Source</label>
          <select value={form.source} onChange={set("source")} className={inputClass}>
            <option value="">Select source</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Status</label>
        <select value={form.currentStatus} onChange={set("currentStatus")} className={inputClass}>
           <option value="">Select Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>


      <div>
        <label className="mb-1 block text-sm text-gray-300">HR Email</label>
        <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="hr@company.com" />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Job Posting URL</label>
        <input type="url" value={form.jobPostingUrl} onChange={set("jobPostingUrl")} className={inputClass} placeholder="https://..." />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Applied Date</label>
        <input type="date" value={form.appliedDate} onChange={set("appliedDate")} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Notes</label>
        <textarea value={form.notes} onChange={set("notes")} rows={3} className={inputClass} placeholder="Any additional notes..." />
      </div>

      <button type="submit" className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-6 py-2.5 font-semibold text-white">
        {submitLabel}
      </button>
    </form>
  );
}