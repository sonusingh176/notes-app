import Link from "next/link";

// Dashboard ke "Recent Topics" section ke liye chhoti list
export default function RecentTopics({ topics }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1b2231] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent Topics</h3>
        <Link href="/admin/topics" className="text-sm text-[#b480ff] hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{topic.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{topic.title}</p>
                <p className="text-xs text-gray-500">{topic.questionCount} questions</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">{topic.createdAt}</span>
          </div>
        ))}

        {topics.length === 0 && (
          <p className="text-sm text-gray-500">No topics yet.</p>
        )}
      </div>
    </div>
  );
}
