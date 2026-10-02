'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// routes/authRoutes.js
// Auth-related URLs ko controller functions se jodta hai, aur har route ke
// aage validation rules (express-validator) lagata hai.
// server.js me ye router `/api/auth` prefix ke saath mount hota hai, isliye
// final URLs banti hain: /api/auth/register, /api/auth/login, /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────

import express from 'express';
import { body } from 'express-validator';

import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/errorHandler.js';
import { loginValidation } from '../validators/auth.validator.js';

const router = express.Router();

// POST /api/auth/register — naya account banane ke liye
// Order: pehle validation rules chalti hain, phir validateRequest check
// karta hai ki sab sahi hai ya nahi, tabhi jaake register() controller chalta hai
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validateRequest,
  register
);

// POST /api/auth/login — login karne ke liye
// router.post(
//   '/login',
//   [
//     body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
//     body('password').notEmpty().withMessage('Password is required'),
//   ],
//   validateRequest,
//   login
// );

router.post(
  '/login',
  loginValidation,
  validateRequest,
  login
);


// GET /api/auth/me — apna profile dekhne ke liye
// `authenticate` yahan pehle chalta hai — matlab bina valid token ke ye
// route kabhi getMe controller tak pahunchega hi nahi
router.get('/me', authenticate, getMe);

export default router;
