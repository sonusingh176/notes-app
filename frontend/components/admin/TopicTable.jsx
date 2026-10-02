import TopicRow from "./TopicRow";

// Topics ki pure table — headers + rows
export default function TopicTable({ topics, onDeleteClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left">
        <thead className="bg-[#11182b] text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Questions</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[#1b2231]">
          {topics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} onDeleteClick={onDeleteClick} />
          ))}

          {topics.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                No topics found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
