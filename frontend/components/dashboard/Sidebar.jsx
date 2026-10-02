"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊", exact: true },
  { label: "Jobs", href: "/dashboard/jobs", icon: "💼" },
  { label: "Profile & Settings", href: "/dashboard/profile", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 z-20 bg-black/50 lg:hidden" />}
      <aside className={`
        fixed inset-y-0 left-0 z-30 flex w-64 flex-col
        border-r border-[var(--border)] bg-[var(--bg-card)]
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <h1 className="font-bold text-lg text-[var(--text-primary)]">
            Job<span className="text-[var(--accent)]">Tracker</span>
          </h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--text-secondary)]">
          Novice Developer
        </div>
      </aside>
    </>
  );
}
