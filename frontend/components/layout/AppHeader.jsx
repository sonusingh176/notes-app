
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/page.module.css";
import LoginModal from "@/components/auth/LoginModal";
import RegistrationModal from "@/components/auth/RegistrationModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu } from 'lucide-react';

export default function AppHeader() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleTrackJob = () => {
    setMenuOpen(false);

    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      setOpenLogin(true);
    }
  };

  const switchToRegister = () => {
    setOpenLogin(false);
    setOpenRegister(true);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <h2 className={styles.logo}>Novice Developer</h2>

          {/* Desktop navigation */}
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
                <span className="text-sm text-gray-300">
                  {user.name}
                </span>

                <button className={styles.loginBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                className={styles.loginBtn}
                onClick={() => setOpenLogin(true)}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile header actions */}
          <div className={styles.mobileHeaderActions}>
            <button
              onClick={toggleTheme}
              className={styles.mobileThemeButton}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Mobile menu button */}
            <button
              className={styles.mobileMenuButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawerOverlay} ${menuOpen ? styles.drawerOverlayOpen : ""
          }`}
        onClick={() => setMenuOpen(false)}
      >
        <aside
          className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.drawerHeader}>
            <h3>Menu</h3>

            <button
              onClick={() => setMenuOpen(false)}
              className={styles.drawerClose}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* User information */}
          {!loading && isAuthenticated && (
            <div className={styles.drawerUser}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className={styles.userInfo}>
                <p className={styles.userName}>{user.name}</p>
                <span className={styles.userStatus}>Logged in</span>
              </div>
            </div>
          )}

          <div className={styles.drawerMenu}>
            <button
              className={styles.drawerItem}
              onClick={handleTrackJob}
            >
              <span>💼</span>
              Track Job
            </button>



            {!loading && !isAuthenticated && (
              <button
                className={styles.drawerItem}
                onClick={() => {
                  setMenuOpen(false);
                  setOpenLogin(true);
                }}
              >
                <span>🔐</span>
                Login
              </button>
            )}
          </div>

          {/* Logout */}
          {!loading && isAuthenticated && (
            <div className={styles.drawerFooter}>
              <button
                className={styles.logoutItem}
                onClick={handleLogout}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          )}
        </aside>
      </div>

      <LoginModal
        openModal={openLogin}
        setOpenModal={setOpenLogin}
        onSwitchToRegister={switchToRegister}
      />

      <RegistrationModal
        openModal={openRegister}
        setOpenModal={setOpenRegister}
      />
    </>
  );
}
