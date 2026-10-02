'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// config/db.js
// Ye file sirf ek kaam karti hai: MongoDB se connect karna.
// server.js is file ko sabse pehle call karta hai, kyunki jab tak database
// connect na ho, app ko start karne ka koi fayda nahi — koi bhi request
// database ke bina fail ho jaayegi.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';

/**
 * connectDB
 * -----------
 * MongoDB se connect karta hai using the connection string from .env
 * (MONGO_URI). Agar .env me MONGO_URI nahi mila, to ek local default
 * fallback use hota hai — sirf development ke liye.
 *
 * Agar connection fail ho jaaye (jaise MongoDB service chal hi nahi rahi),
 * to hum poore process ko turant band (exit) kar dete hain — ek server jo
 * database se connect nahi hai, wo aadha-adhoora chalne se behtar hai ki
 * chale hi na, taaki problem turant dikh jaaye.
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes_saas';

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 sec me try kar ke haar maan lo, taaki app "hang" na lage
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // 1 = exit code for "something went wrong"
  }
};

export default connectDB;
