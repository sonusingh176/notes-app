"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Route ke segments se page ka title nikalne ke liye chhota helper
// e.g. /admin/topics/create -> "Topics / Create"
function getTitleFromPath(pathname) {
  const segments = pathname.replace("/admin", "").split("/").filter(Boolean);

  if (segments.length === 0) return "Dashboard";

  return segments
    .map((seg) => {
      if (seg.startsWith("[") || seg === "edit") return null; // dynamic id ya "edit" skip karo
      return seg.charAt(0).toUpperCase() + seg.slice(1);
    })
    .filter(Boolean)
    .join(" / ");
}

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const { user, isAuthenticated, logout, loading } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#11182b] px-8 py-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>

      {/* Dummy admin profile — auth abhi tak nahi add kiya hai (Phase 3) */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{user?.name}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b480ff] text-sm font-semibold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white  py-2 px-2" onClick={logout}>
              Logout
        </button>
      </div>
    </header>
  );
}
