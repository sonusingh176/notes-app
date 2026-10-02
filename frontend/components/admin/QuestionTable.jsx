import QuestionRow from "./QuestionRow";

// Questions ki pure table — headers + rows
export default function QuestionTable({ questions, onDeleteClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left">
        <thead className="bg-[#11182b] text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Question</th>
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3">Difficulty</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-[#1b2231]">
          {questions.map((q) => (
            <QuestionRow key={q.id} question={q} onDeleteClick={onDeleteClick} />
          ))}

          {questions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                No questions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
