
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/page.module.css";
import LoginModal from "@/components/auth/LoginModal";
import RegistrationModal from "@/components/auth/RegistrationModal";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

import {
  Menu,
  ChevronDown,
  ChevronUp,
  UserRound,
  LogOut,
} from "lucide-react";

export default function AppHeader() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleTrackJob = () => {
    setMenuOpen(false);

    if (isAuthenticated) {
      // router.push("/dashboard");
      router.push(user?.role === "super_admin" ? "/admin/dashboard" : "/dashboard");
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
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={styles.desktopThemeButton}
            >
              {theme === "dark" ? "Light ☀️" : "Dark 🌙"}
            </button>

            {/* Track Job */}
            {user?.role !== "super_admin" && (
              <button
                onClick={handleTrackJob}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-[#b480ff] px-4 py-1.5 text-sm font-semibold text-white"
              >
                Track Job
              </button>
            )}

            {/* Authentication */}
            {loading ? null : isAuthenticated ? (
              <div className={styles.userDropdownWrapper}>
                <button
                  className={styles.userDropdownTrigger}
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                >
                  <div className={styles.desktopAvatar}>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <span className={styles.desktopUserName}>
                    {user.name}
                  </span>

                  {userDropdownOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownProfile}>
                      <p className={styles.dropdownName}>
                        {user.name}
                      </p>

                      <p className={styles.dropdownEmail}>
                        {user.email}
                      </p>
                    </div>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        router.push(user?.role === "super_admin" ? "/admin/dashboard" : "/dashboard");
                      }}
                    >
                      <UserRound size={18} />
                      <span>Dashboard</span>
                    </button>

                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut size={18} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
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
