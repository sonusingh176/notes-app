"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBox from "@/components/admin/SearchBox";
import TopicTable from "@/components/admin/TopicTable";
import DeleteDialog from "@/components/admin/DeleteDialog";
import { subjectApi } from "@/lib/api";

export default function SubjectPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topicToDelete, setTopicToDelete] = useState(null);

  useEffect(() => {
    subjectApi.getAll()
      .then((res) => setTopics(res.subjects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // client-side search
  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    try {
      await subjectApi.delete(topicToDelete._id);
      setTopics((prev) => prev.filter((t) => t._id !== topicToDelete._id));
    } catch (err) {
      console.error(err);
    } finally {
      setTopicToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search subjects..." />
        <Link
          href="/admin/subject/create"
          className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New Subject
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <TopicTable topics={filteredTopics} onDeleteClick={setTopicToDelete} />
      )}

      <DeleteDialog
        open={!!topicToDelete}
        itemName={topicToDelete?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTopicToDelete(null)}
      />
    </div>
  );
}