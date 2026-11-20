"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, LogOut, UserRound, Sun, Moon } from "lucide-react";

function getTitle(pathname) {
  return (
    pathname
      .replace("/admin", "")
      .split("/")
      .filter((seg) => seg && !seg.startsWith("[") && seg !== "edit")
      .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
      .join(" / ") || "Dashboard"
  );
}

export default function Header() {
  const title = getTitle(usePathname());
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#11182b] px-4 py-4 sm:px-6 lg:px-8">
      <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User dropdown */}
        {!loading && user && (
          <div className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white hover:bg-white/5 sm:gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b480ff] text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>

              <span className="hidden max-w-[160px] truncate text-sm text-gray-300 sm:block">
                {user.name}
              </span>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setOpen(false)}
                  aria-label="Close dropdown"
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1b2231] shadow-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="mt-1 break-all text-xs text-gray-400">{user.email}</p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                    >
                      <UserRound size={17} /> Profile
                    </button>

                    <button
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}