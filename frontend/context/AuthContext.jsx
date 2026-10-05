"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi, getToken, removeToken, setToken } from "@/lib/api";
import { useRouter} from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDashboardRoute = (user) => {
   
    if (user.role === "super_admin") router.replace("/admin");
    else router.replace("/dashboard");
  };

  const saveUser = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
   
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
    getDashboardRoute(res.user);
    return res;
  };

  // Google login: backend se JWT lo, save karo, role ke hisaab se redirect
const googleLogin = async (credential) => {
  const res = await authApi.google(credential);
  setToken(res.token);
  saveUser(res.user);
  getDashboardRoute(res.user);
  return res;
};

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    setUser(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login,googleLogin, isAuthenticated: !!user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
