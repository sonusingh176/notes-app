"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdown, setDropdown] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-6 py-4">
      <button
        onClick={onMenuClick}
        className="text-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
      >
        ☰
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="relative">
          <button onClick={() => setDropdown((p) => !p)} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm text-[var(--text-primary)]">{user?.name}</span>
            <span className="text-xs text-[var(--text-secondary)]">▾</span>
          </button>

          {dropdown && (
            <>
              <div onClick={() => setDropdown(false)} className="fixed inset-0 z-10" />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-xl">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-white/5 rounded-t-xl"
                >
                  👤 Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-b-xl"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
