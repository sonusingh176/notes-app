import Link from "next/link";

// Topics table ki ek single row
export default function TopicRow({ topic, onDeleteClick }) {
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/5">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{topic.icon}</span>
          <div>
            <p className="font-medium text-white">{topic.name}</p>
            <p className="text-xs text-gray-500">/{topic.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-400">{topic.description}</td>
      <td className="px-4 py-3 text-sm text-gray-400">-</td>
      <td className="px-4 py-3 text-sm text-gray-400">{new Date(topic.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/subject/${topic._id}/edit`}
            className="rounded-lg px-3 py-1.5 text-sm text-[#b480ff] hover:bg-[#b480ff]/10"
          >
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(topic)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
