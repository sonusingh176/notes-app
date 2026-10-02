import Link from "next/link";

const difficultyColor = {
  Easy: "bg-green-500/15 text-green-400",
  Medium: "bg-yellow-500/15 text-yellow-400",
  Hard: "bg-red-500/15 text-red-400",
};

// Questions table ki ek single row
export default function QuestionRow({ question, onDeleteClick }) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/5">
      <td className="px-4 py-3">
        <p className="max-w-md truncate font-medium text-white">{question.question}</p>
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">{question.topicTitle}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            difficultyColor[question.difficulty] || "bg-white/10 text-gray-300"
          }`}
        >
          {question.difficulty}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">{question.createdAt}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/questions/${question.id}/edit`}
            className="rounded-lg px-3 py-1.5 text-sm text-[#b480ff] hover:bg-[#b480ff]/10"
          >
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(question)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
