'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// middleware/auth.js
// Do middleware functions hain:
// 1. authenticate — check karta hai ki request ke saath valid JWT token hai
// 2. authorize    — check karta hai ki logged-in user ka role sahi hai
//
// Ye dono routes me is order me chain hote hain:
//   router.get('/admin-only', authenticate, authorize('super_admin'), controllerFn)
//                                  ↑ pehle login check    ↑ phir role check   ↑ tab jaake asli kaam
// ─────────────────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * authenticate
 * --------------
 * JWT token verify karta hai aur req.user me logged-in user attach karta hai.
 * Iske baad wale controller/middleware `req.user` seedha use kar sakte hain.
 *
 * Flow:
 * 1. Authorization header se token nikalo ("Bearer <token>" format)
 * 2. jwt.verify() se token decode + validate karo
 * 3. decoded id se database se FRESH user nikalo (cache/token ke data par
 *    bharosa nahi karte — agar user block ho chuka ho, turant pakda jaaye)
 * 4. req.user set karke next() call karo
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer xxx" me se sirf "xxx"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Token invalid. User not found.' });
    }

    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
};

/**
 * authorize (higher-order middleware)
 * ---------------------------------------
 * Sirf specific role wale users ko aage jaane deta hai.
 * Usage: authorize('super_admin')
 *
 * Ye function khud middleware nahi hai — ye ek middleware RETURN karta hai.
 * Isliye routes me `authorize('super_admin')` likhte hain (function ko
 * call karke), na ki `authorize` (bina call kiye).
 *
 * IMPORTANT: Isse pehle hamesha `authenticate` chalna chahiye, warna
 * req.user undefined hoga aur ye galti se sabko block kar dega.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.',
      });
    }
    next();
  };
};

export { authenticate, authorize };
