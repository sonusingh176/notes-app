'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// server.js
// App ka entry point. Yahan Express app banta hai, middleware lagti hai,
// routes mount hoti hain, aur sabse aakhri me server start hota hai.
//
// BOOT ORDER (top se bottom) — ye order zaroori hai, random nahi:
// 1. dotenv.config()                    ← sabse PEHLE, taaki niche ki har
//                                          file (jaise config/db.js) ko
//                                          process.env.* values mil sakein
// 2. Express app + middleware            ← cors, helmet, json parser
//                                          (in-coming requests ko yahan se
//                                          guzarna hota hai, isliye routes
//                                          se pehle lagti hain)
// 3. Health check + Routes               ← beech me
// 4. 404 handler                         ← saare routes ke BAAD (jo bhi
//                                          upar match na ho, wo yahan aayega)
// 5. Global error handler (errorHandler) ← sabse AAKHRI (Express ise 4-arg
//                                          signature se error-handler
//                                          pehchanta hai)
// 6. startServer()                       ← database connect karke tab
//                                          jaake app.listen() chalta hai
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config(); // .env file ko process.env me load karo — sabse pehle, kyunki
// niche wali imports (jaise connectDB) ko turant process.env.MONGO_URI chahiye

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import questionRoutes from './routes/questionRoutes.js'
import jobApplicationRoutes  from './routes/JobApplicationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // sirf isi frontend origin se requests allow hongi
    credentials: true, // cookies/auth headers cross-origin requests me allowed
  })
);

app.use(helmet()); // kuch common security headers automatically set kar deta hai

app.use(express.json({ limit: '10mb' })); // JSON body parse karne ke liye (req.body milta hai isi se)
app.use(express.urlencoded({ extended: true })); // form-urlencoded body parse karne ke liye

// ── Health Check ──────────────────────────────────────────────────────────────
// ye route bata deta hai ki server zinda hai ya nahi (testing/monitoring ke liye useful)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Notes SaaS API (MongoDB) is running 🚀', timestamp: new Date() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes); // register, login, me
app.use('/api/subject',subjectRoutes);
app.use('/api/question',questionRoutes);
app.use('/api/job-applications', jobApplicationRoutes);




// ── 404 ───────────────────────────────────────────────────────────────────────
// jo bhi route upar match nahi hua, uske liye ye chalega
// (isko saare routes ke BAAD likhna zaroori hai, warna sab kuch 404 hi bhejega
//  aur koi bhi real route kabhi apne controller tak pahunch hi nahi payega)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// hamesha sabse aakhri me lagana hai
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

/**
 * startServer
 * -------------
 * Pehle database se connect hota hai, tabhi Express server listen karna
 * start karta hai. Isse ye guarantee milti hai ki server "ready" hone tak
 * MongoDB connected ho — warna requests aa sakti hain database ke connect
 * hone se pehle hi, aur wo sab fail ho jaayengi.
 */
const startServer = async () => {
  await connectDB(); // pehle database se connect karo
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
