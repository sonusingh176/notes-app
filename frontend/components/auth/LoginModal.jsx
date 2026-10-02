"use client";
import { useState } from "react";
import {authApi,setToken} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";



export default function LoginModal({ openModal, setOpenModal }) {
  if (!openModal) return null;
  const { login,setUser } = useAuth();


  const [formData,setFormData]=useState({
    email:"",
    password:"",
  });

  const [loading, setLoading] =useState(false);
  const [error,setError]= useState("");

  const handleChange =(e)=>{
    const {name,value}=e.target;
   

    setFormData((prev)=>({...prev ,[name]:value,}));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
    setError("");
  
    try {

      await login(formData);
      setOpenModal(false);
  
    } catch (err) {
      console.log(err)
      setError(err.message);
    } finally {
      setLoading(false);
    }


  };

  return (
    <div
      onClick={()=>setOpenModal(false)} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto p-4"
      >
      
      <div
        onClick={(e)=>e.stopPropagation()}
        className="relative my-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1b2231] p-6 text-white shadow-2xl"  
        >

        {/* Close Button */}
        <button
          onClick={() => setOpenModal(false)}
          className="absolute right-4 top-4 text-xl text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="mb-1 text-2xl font-bold">
          Sign in to unlock
        </h2>

        <p className="mb-3 text-sm text-gray-400">
          Unlimited access to all questions and answers.
        </p>

        {/* Benefits — single compact row instead of 3 stacked lines */}
        <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1 border-b border-gray-700 pb-3 text-xs text-gray-300">
          <span>✔ Premium access</span>
          <span>✔ Track progress</span>
          <span>✔ Save favourites</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-600 bg-[#2b3242] px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-600 bg-[#2b3242] px-4 py-2.5 outline-none focus:border-indigo-500"
            />
          </div>
          {
              error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )
            }
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 py-2.5 font-semibold"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Need an account?{" "}
          <button className="text-white hover:underline">
            Sign up
          </button>
        </p>

        <button className="mt-1 w-full text-center text-sm text-blue-400 hover:underline">
          Forgot password?
        </button>

        <div className="my-4 flex items-center">
          <div className="h-px flex-1 bg-gray-700"></div>
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <div className="h-px flex-1 bg-gray-700"></div>
        </div>

        <button className="w-full rounded-lg bg-white py-2.5 font-semibold text-black hover:bg-gray-100">
          Continue with Google
        </button>

      </div>
    </div>
  );
}