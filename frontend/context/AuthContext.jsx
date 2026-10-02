"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, removeToken, setToken } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDashboardRoute = (user) => {
    console.log(user,"user")
    if (user.role === "super_admin" && !pathname.startsWith("/admin")) {
      router.replace("/admin");
    } else if (user.role === "user" && !pathname.startsWith("/dashboard")) {
      router.replace("/dashboard");
    }
  };

  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    getDashboardRoute(user);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false);
    }

    authApi.me()
      .then((res) => saveUser(res.user))
      .catch(() => logout())
      .finally(() => { if (!cachedUser) setLoading(false); });
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setToken(res.token);
    saveUser(res.user);
    return res;
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    setUser(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
