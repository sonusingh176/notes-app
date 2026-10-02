"use client";

// Reusable delete-confirmation modal — Topics aur Questions dono list pages
// isi ek component ko use karenge (sirf itemName text alag hoga).
//
// Props:
//   open       -> dialog dikhana hai ya nahi
//   itemName   -> jo delete ho raha hai uska naam (e.g. "JavaScript")
//   onConfirm  -> "Delete" button click hone par chalega
//   onCancel   -> "Cancel" ya backdrop click hone par chalega
export default function DeleteDialog({ open, itemName, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-[#1b2231] p-6 text-white shadow-2xl"
      >
        <h3 className="text-lg font-bold">Delete "{itemName}"?</h3>
        <p className="mt-2 text-sm text-gray-400">
          This action cannot be undone. This is dummy data for now, so nothing
          is permanently lost — but this is how the real delete flow will work.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
