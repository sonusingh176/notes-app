"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar ke navigation links — yahan se naya admin section add karna easy hai
const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Subjects", href: "/admin/subject", icon: "📁" },
  { label: "Questions", href: "/admin/questions", icon: "❓" },
];

export default function Sidebar() {
  // current URL path nikalo, taaki active link ko highlight kar sakein
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0f1524] text-white">
      <div className="px-6 py-6">
        <h1 className="text-lg font-bold text-white">
          Interview<span className="text-[#b480ff]">Admin</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          // ye link active hai agar pathname exactly match kare ya uska sub-route ho
          // (e.g. /admin/topics/create bhi "Topics" ko active dikhana chahiye)
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[#b480ff]/15 text-[#b480ff]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-gray-500">
        Phase 3 — no auth (dev mode)
      </div>
    </aside>
  );
}
