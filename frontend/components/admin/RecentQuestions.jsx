import Link from "next/link";

// Difficulty badge ka color — Easy/Medium/Hard ke hisaab se
const difficultyColor = {
  Easy: "bg-green-500/15 text-green-400",
  Medium: "bg-yellow-500/15 text-yellow-400",
  Hard: "bg-red-500/15 text-red-400",
};

// Dashboard ke "Recent Questions" section ke liye chhoti list
export default function RecentQuestions({ questions }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1b2231] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent Questions</h3>
        <Link href="/admin/questions" className="text-sm text-[#b480ff] hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{q.question}</p>
              <p className="text-xs text-gray-500">{q.topicTitle}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                difficultyColor[q.difficulty] || "bg-white/10 text-gray-300"
              }`}
            >
              {q.difficulty}
            </span>
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-sm text-gray-500">No questions yet.</p>
        )}
      </div>
    </div>
  );
}
