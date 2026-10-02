'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// middleware/errorHandler.js
// Do cheezein handle karta hai:
// 1. validateRequest — express-validator ke validation errors ko ek
//    consistent response format me convert karta hai
// 2. errorHandler    — poore app ka global/central error handler
//    (Express ka special 4-argument middleware — (err, req, res, next))
// ─────────────────────────────────────────────────────────────────────────────

import { validationResult } from 'express-validator';

/**
 * validateRequest
 * ------------------
 * Routes me lage express-validator rules (body('email').isEmail() etc.) ke
 * errors ko check karta hai. Agar koi validation fail hui to yahin 422
 * response bhej deta hai — controller tak request jaane hi nahi deta.
 *
 * Usage pattern (routes/authRoutes.js me):
 *   router.post('/register', [body('email').isEmail(), ...], validateRequest, register)
 *                                   ↑ validation rules      ↑ ye check karta hai   ↑ controller
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * errorHandler
 * ---------------
 * App ka global error handler. server.js me ye sabse AAKHRI middleware
 * hota hai. Jab bhi koi controller `next(error)` call karta hai, ya koi
 * unexpected error throw hoti hai, request yahin aati hai.
 *
 * NOTE: Iske 4 parameters (err, req, res, next) hona zaroori hai — Express
 * isi signature se pehchanta hai ki ye ek error-handling middleware hai
 * (normal middleware me sirf 3 parameters hote hain: req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.stack || err.message);

  // Mongoose: duplicate unique field ka error (jaise same email dobara register)
  // MongoDB is error ko code 11000 ke saath deta hai
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `This ${field} is already registered.`,
    });
  }

  // Mongoose: schema validation fail hui (jaise invalid email format)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Mongoose: galat format ka ObjectId bheja gaya (jaise "/users/abc123")
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}.`,
    });
  }

  // koi aur unexpected error — generic 500 response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export { validateRequest, errorHandler };
