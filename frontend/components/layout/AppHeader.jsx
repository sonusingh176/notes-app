"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/page.module.css";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function AppHeader() {
  const [openModal, setOpenModal] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleTrackJob = () => {
    if (isAuthenticated) router.push("/dashboard");
    else setOpenModal(true);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <h2 className={styles.logo}>Novice Developer</h2>
          <div className={styles.navButtons}>
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button
              onClick={handleTrackJob}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-4 py-1.5 text-sm font-semibold text-white"
            >
              Track Job
            </button>
            {loading ? null : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300">Hi, {user.name}</span>
                <button className={styles.loginBtn} onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={() => setOpenModal(true)}>Login</button>
            )}
          </div>
        </div>
      </nav>
      <LoginModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
}
