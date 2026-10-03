"use client";
import { useEffect, useState } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import RecentTopics from "@/components/admin/RecentTopics";
import RecentQuestions from "@/components/admin/RecentQuestions";
import { subjectApi, questionApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([subjectApi.getAll(), questionApi.getAll()])
      .then(([subRes, qRes]) => {
        setSubjects(subRes.subjects || []);
        setQuestions(qRes.questions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeSubjects = subjects.filter((s) => s.status === "active").length;
  const activeQuestions = questions.filter((q) => q.status === "active").length;
  const inactiveQuestions = questions.filter((q) => q.status === "inactive").length;

  // Recent 5 — createdAt se sort
  const recentSubjects = [...subjects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentQuestions = [...questions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#b480ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Subjects" value={subjects.length} icon="📁" />
        <DashboardCard label="Active Subjects" value={activeSubjects} icon="✅" />
        <DashboardCard label="Total Questions" value={questions.length} icon="❓" />
        <DashboardCard label="Active Questions" value={activeQuestions} icon="🟢" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTopics topics={recentSubjects} />
        <RecentQuestions questions={recentQuestions} />
      </div>
    </div>
  );
}