'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// models/User.js
// Ye "User" ka blueprint (schema) define karta hai — MongoDB me User
// collection kaise dikhegi, kaunse fields zaroori hain, aur password ko
// automatically hash karne wala logic bhi yahin hai.
//
// Note: MySQL wale backend me "Role" ek alag table thi (foreign key se
// judi hui). MongoDB me hum wahi cheez ek simple STRING field
// (role: "user" | "super_admin") se karte hain, kyunki MongoDB documents
// self-contained rehte hain — chhoti si fixed list (sirf 2 roles) ke liye
// alag collection banana zaroorat se zyada complex ho jaata.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // aage-peeche ke extra spaces apne aap hata dega
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // ek email se sirf ek hi account ban sakta hai
      trim: true,
      lowercase: true, // "User@Mail.com" aur "user@mail.com" ko same treat karega
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // IMPORTANT: normal queries me password field return NAHI hogi
      // (jab chahiye ho, jaise login me, tab explicitly .select('+password') likhna padega)
    },
    role: {
      // sirf yahi 2 values allowed hain
      type: String,
      enum: ['user', 'super_admin'],
      default: 'user', // public registration se hamesha normal "user" hi banta hai
    },
    is_blocked: {
      // true hone par login block ho jaata hai (authController + middleware dono check karte hain)
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt fields apne aap add ho jaayengi
  }
);

/**
 * pre('save') hook
 * -------------------
 * Ye Mongoose ka "middleware" hai — document ko database me save karne se
 * PEHLE ye function chalta hai. Hum isko password hash karne ke liye use
 * kar rahe hain, taaki controller me kabhi manually hash na karna pade —
 * bas plain password de do, model khud sambhal lega.
 *
 * `this.isModified('password')` check karna zaroori hai — warna jab bhi
 * user apna naam update karega, password bhi dobara (already-hashed value
 * ko phir se hash karke) corrupt ho jaayega.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // password change nahi hua, kuch mat karo
  }

  this.password = await bcrypt.hash(this.password, 12); // 12 = salt rounds
  next();
});

/**
 * comparePassword (instance method)
 * -----------------------------------
 * Login ke waqt, user jo plain password type karta hai, usko database me
 * stored hashed password se compare karta hai.
 * `this.password` yahan available hoga sirf tab jab query ke saath
 * explicitly `.select('+password')` use kiya gaya ho (kyunki schema me
 * upar `select: false` set hai).
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * toJSON transform
 * -------------------
 * Jab bhi ye document JSON me convert hota hai (jaise res.json(user) karte
 * waqt), Mongoose automatically ye transform chalata hai. Hum isse
 * password field ko response se hamesha hata dete hain — security ke liye,
 * taaki hashed password bhi kabhi galti se frontend tak na pahunche.
 */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
