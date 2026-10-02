"use client";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Profile & Settings</h2>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{user?.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{user?.role?.name}</p>
          </div>
        </div>
        <hr className="border-[var(--border)]" />
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Email</p>
            <p className="text-sm text-[var(--text-primary)]">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-[var(--text-secondary)] mb-1">Member Since</p>
            <p className="text-sm text-[var(--text-primary)]">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
