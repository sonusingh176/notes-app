"use client";
import { useState } from "react";
import { authApi, setToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegistrationModal({ openModal, setOpenModal }) {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!openModal) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.register(formData);
      setToken(res.token);
      setUser(res.user);
      setOpenModal(false);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setOpenModal(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1b2231] p-6 text-white shadow-2xl"
      >
        <button
          onClick={() => setOpenModal(false)}
          className="absolute right-4 top-4 text-xl text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="mb-1 text-2xl font-bold">Sign up</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-600 bg-[#2b3242] px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-600 bg-[#2b3242] px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-600 bg-[#2b3242] px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 py-2.5 font-semibold"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}