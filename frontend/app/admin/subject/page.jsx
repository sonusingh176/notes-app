"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBox from "@/components/admin/SearchBox";
import TopicTable from "@/components/admin/TopicTable";
import DeleteDialog from "@/components/admin/DeleteDialog";
import { dummyTopics } from "@/lib/dummy-data";

// Topics list page — search + delete dummy data ke saath.
// NOTE: "delete" sirf local state se hatata hai. Page refresh hone par
// dummyTopics se dobara load ho jayega — real delete ke liye backend chahiye (Phase 4).
export default function TopicsPage() {
  const [topics, setTopics] = useState(dummyTopics);
  const [search, setSearch] = useState("");
  const [topicToDelete, setTopicToDelete] = useState(null); // null = dialog band hai

  // search text se title/description match karo (case-insensitive)
  const filteredTopics = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmDelete = () => {
    setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id));
    setTopicToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search topics..." />

        <Link
          href="/admin/subject/create"
          className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-5 py-2.5 text-sm font-semibold text-white"
        >
          + New Subject 
        </Link>
      </div>

      <TopicTable topics={filteredTopics} onDeleteClick={setTopicToDelete} />

      <DeleteDialog
        open={!!topicToDelete}
        itemName={topicToDelete?.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTopicToDelete(null)}
      />
    </div>
  );
}
