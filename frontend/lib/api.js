import axios from "axios";

// lib/api.js
// -----------------------------------------------------------------------------
// Backend se baat karne ka single centralized place — ab axios use kar rahe
// hain. `client` instance banate hain (baseURL + interceptor set karke),
// aur authApi.login/register/me isi client se call karte hain.
// -----------------------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const TOKEN_KEY = "notesapp_token";

// ── Token storage (save your token) ─────────────────────────────────────────
// Token ko localStorage me save kar rahe hain, taaki page refresh/reload hone
// par bhi user logged-in rahe (browser band karne tak ya logout karne tak).

export function getToken() {
  if (typeof window === "undefined") return null; // SSR safety — window sirf browser me hota hai
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}



// ── Axios instance ───────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: har request ke saath, agar token available hai,
// automatically "Authorization: Bearer <token>" header laga do.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: backend ka error response ({ success, message, errors })
// ko ek consistent Error object me convert karo, jaise pehle fetch wale version
// me tha — taaki LoginModal.jsx me `err.message` / `err.errors` same tarah kaam kare.
client.interceptors.response.use(
  (response) => response.data,
  (err) => {
    const data = err.response?.data;
    const error = new Error(data?.message || "Something went wrong.");
    error.status = err.response?.status;
    error.errors = data?.errors;
    return Promise.reject(error);
  }
);

// ── Auth API calls ───────────────────────────────────────────────────────────
export const authApi = {
  register: (payload) => client.post("/auth/register", payload),
  login: (payload) => client.post("/auth/login", payload),
  google: (credential) => client.post("/auth/google", { credential }),
  me: () => client.get("/auth/me"),
};



// Subject CRUD API
export const subjectApi = {
  create: (data) => client.post("/subject/create-subject", data),
  getAll: () => client.get("/subject/get-subject"),
  update: (id, data) => client.put(`/subject/update-subject/${id}`, data),
  delete: (id) => client.delete(`/subject/delete-subject/${id}`),
};


// Questions CRUD API
export const questionApi = {
  create: (data) => client.post("/question/create-question", data),
  getBySubject: (subjectId) => client.get(`/get-question/${subjectId}`),
  getAll: () => client.get("/question/get-all-questions"), // backend me banana padega
  update: (id, data) => client.put(`/question/update-question/${id}`, data),
  delete: (id) => client.delete(`/delete-question/${id}`),
};


export const jobApi = {
  create: (data) => client.post("/job-applications/create", data),
  getAll: (params) => client.get("/job-applications/get", { params }),
  getById: (id) => client.get(`/job-applications/${id}`),
  update: (id, data) => client.put(`/job-applications/${id}`, data),
  updateStatus: (id, data) => client.patch(`/job-applications/${id}/status`, data),
  delete: (id) => client.delete(`/job-applications/${id}`),
  getStatuses: () => client.get("/job-applications/statuses"),
};

export const publicApi = {
  getSubjects: () => client.get("/subject/public"),
  getQuestions: (subjectId) => client.get(`/question/public/${subjectId}`),
};

// AI Assistant API
// -----------------------------------------------------------------------------
// Chatbot se related saari API calls yahan rakhenge.
//
// `client` already has an Axios interceptor which automatically adds:
// Authorization: Bearer <token>
//
// Isliye chatbot request ke saath hume manually token bhejne ki zarurat nahi.
// -----------------------------------------------------------------------------

export const aiApi={
  ask:(question)=>client.post('ai/ask',{question}),
}