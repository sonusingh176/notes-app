import DashboardCard from "@/components/admin/DashboardCard";
import RecentTopics from "@/components/admin/RecentTopics";
import RecentQuestions from "@/components/admin/RecentQuestions";
import { dummyTopics, dummyQuestions, getRecent } from "@/lib/dummy-data";

// Dashboard — sirf dummy data dikhata hai abhi (Phase 3, no backend).
// Server component hai kyunki ismein koi interactivity/hooks nahi chahiye.
export default function DashboardPage() {
  const totalQuestions = dummyQuestions.length;
  const totalTopics = dummyTopics.length;
  const easyCount = dummyQuestions.filter((q) => q.difficulty === "Easy").length;
  const hardCount = dummyQuestions.filter((q) => q.difficulty === "Hard").length;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Topics" value={totalTopics} icon="📁" />
        <DashboardCard label="Total Questions" value={totalQuestions} icon="❓" />
        <DashboardCard label="Easy Questions" value={easyCount} icon="🟢" />
        <DashboardCard label="Hard Questions" value={hardCount} icon="🔴" />
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTopics topics={getRecent(dummyTopics, 5)} />
        <RecentQuestions questions={getRecent(dummyQuestions, 5)} />
      </div>
    </div>
  );
}
