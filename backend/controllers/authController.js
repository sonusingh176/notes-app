'use strict';


// ─────────────────────────────────────────────────────────────────────────────
// controllers/authController.js
// Auth flow ka actual business logic yahan hai: register, login, aur
// "get my profile" (me). Routes (routes/authRoutes.js) sirf in functions
// ko URL se jodte hain — asli kaam yahan hota hai.
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * signToken (helper function)
 * ------------------------------
 * User ka JWT token banata hai. Register/Login ke baad user ko ye token
 * milta hai, aur isi token ko future requests me
 * `Authorization: Bearer <token>` header me bhejna hota hai
 * (middleware/auth.js isko verify karta hai).
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * POST /api/auth/register
 * --------------------------
 * Naya user register karta hai.
 *
 * Order of steps (ye order zaroori hai):
 * 1. Email already registered to nahi hai, check karo
 *    → agar hum ye check skip karke seedha User.create() karte, to bhi
 *      MongoDB duplicate email pe error deta (unique: true index ki wajah
 *      se) — lekin wo error kam friendly hota. Pehle khud check karke hum
 *      ek clean, samajhne-wala message de paate hain.
 * 2. User.create() call karo — password model ke pre('save') hook se
 *    apne-aap hash ho jaayega (User.js dekho)
 * 3. JWT token generate karo aur response bhejo
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // role field nahi bheja — schema me default 'user' already set hai,
    // isliye public registration se kabhi super_admin nahi ban sakta
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user, // password field automatically hidden hai (toJSON transform, User.js me)
    });
  } catch (error) {
    next(error); // error ko global errorHandler (middleware/errorHandler.js) ko de diya
  }
};

/**
 * POST /api/auth/login
 * -----------------------
 * Existing user ko login karta hai.
 *
 * Order of steps:
 * 1. Email se user dhoondo — aur explicitly password field bhi mangwao
 *    (`.select('+password')`), kyunki schema me password `select: false`
 *    hai by default (security ke liye).
 * 2. Password compare karo (bcrypt.compare via user.comparePassword)
 * 3. Blocked user ko login se rok do
 * 4. last_login update karo, JWT token generate karo, response bhejo
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');


    // if (user.authProvider === 'google') {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Login With Google.',
    //   });
    // }

    // Security tip: email exist nahi karta aur password galat hai — dono
    // cases me SAME error message bhejo, taaki koi guess na kar sake ki
    // ye email database me hai ya nahi
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
    }

    user.last_login = new Date();
    await user.save();

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user, // password field automatically hidden hai (toJSON transform)
    });
  } catch (error) {
    next(error);
  }
};



const googleLogin = async(req,res,next)=>{
  try {
    const {credential }=req.body;

    // Google se token verify karo (fake token yahin pakda jayega)
    const ticket = await googleClient.verifyIdToken({
      idToken:credential,
      audience:process.env.GOOGLE_CLIENT_ID,
    });

    const {email,name,sub,email_verified}=ticket.getPayload();

     if (!email_verified) {
      return res.status(401).json({ success: false, message: "Google email verified nahi hai." });
    }

    // Email se user dhundo, nahi mila to naya banao
    let user = await User.findOne({ email });

    if(!user){
      user=await User.create({name,email,googleId:sub, authProvider: "google" });

    }else if(!user.googleId) {
      // purana email/password user: Google account link kar do
      user.googleId = sub;
      await user.save();
    }

    // Token wahi helper se banao jo login() me use hota hai
    const token = signToken(user._id);
    res.json({ success: true, token, user });


  } catch (error) {
     next(error);
  }
}

/**
 * GET /api/auth/me
 * --------------------
 * Currently logged-in user ka data return karta hai.
 * `req.user` yahan middleware/auth.js ke `authenticate` function se aata
 * hai — iska matlab ye route hamesha `authenticate` middleware ke peeche
 * (protected) hota hai. Isiliye routes/authRoutes.js me is route pe
 * `authenticate` middleware lagaya gaya hai, register/login pe nahi.
 */
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

export { register, login, getMe ,googleLogin};
