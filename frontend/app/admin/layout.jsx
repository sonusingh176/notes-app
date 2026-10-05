"use client";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {

  const { loading, user, isAuthenticated } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loading && (!isAuthenticated ||  user?.role !== "super_admin")) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f1a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#b480ff]" />
      </div>
    );
  }

  
  if (!isAuthenticated || user?.role !== "super_admin") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1524]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
