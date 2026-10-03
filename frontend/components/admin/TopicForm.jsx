"use client";

import { useState } from "react";

// Shared form — Create aur Edit, dono pages isi ko use karenge.
// "Create" me initialData khali hota hai, "Edit" me initialData prefilled aata hai.
//
// Props:
//   initialData -> { title, slug, description, icon } (optional)
//   onSubmit     -> form submit hone par chalega, formData object ke saath
//   submitLabel  -> button ka text (e.g. "Create Topic" / "Save Changes")
export default function TopicForm({ initialData = {}, onSubmit, submitLabel = "Save" }) {
  const [form, setForm] = useState({
      name: initialData.name || "",       // ← title nahi, name
      slug: initialData.slug || "",
      description: initialData.description || "",
      icon: initialData.icon || "📁",
  });

  // generic change handler — sabhi inputs isi ek function se update honge
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // title type karte waqt slug automatically generate ho jaaye (sirf jab user ne
      // slug ko khud kabhi manually edit nahi kiya — yahan simplicity ke liye hamesha
      // auto-generate kar rahe hain jab tak slug field khud edit na ho)
      if (field === "name") {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm text-gray-300">Title</label>
        <input
          type="text"
          value={form.name}
          onChange={handleChange("name")}
          required
          placeholder="e.g. JavaScript"
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={handleChange("slug")}
          required
          placeholder="e.g. javascript"
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        />
        <p className="mt-1 text-xs text-gray-500">Auto-generated from title, but you can edit it.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Icon (emoji)</label>
        <input
          type="text"
          value={form.icon}
          onChange={handleChange("icon")}
          placeholder="📁"
          className="w-24 rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-center text-xl outline-none focus:border-[#b480ff]"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-300">Description</label>
        <textarea
          value={form.description}
          onChange={handleChange("description")}
          rows={4}
          placeholder="Short description of this topic..."
          className="w-full rounded-lg border border-white/10 bg-[#1b2231] px-4 py-2.5 text-white outline-none focus:border-[#b480ff]"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-6 py-2.5 font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
