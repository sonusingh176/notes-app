# Notes SaaS Backend — MongoDB Version (Auth Only)

This is the **MongoDB + Mongoose** version of the backend for the Notes SaaS
app. You already have a MySQL + Sequelize version — this one does the same
job (auth: register, login, "who am I") but talks to MongoDB instead of
MySQL.

Right now **only the Auth module is complete**. Notes, Subjects, Admin
panel, etc. are not built yet — this README only covers what exists today.

---

## 1. What is in this folder, and why

```
backend_mongodb/
├── server.js              ← the entry point. Starting point of everything.
├── .env                    ← secret/config values (ports, DB url, JWT secret)
├── config/
│   └── db.js                ← connects to MongoDB
├── models/
│   └── User.js               ← shape of a "user" document + password hashing
├── controllers/
│   └── authController.js     ← the actual logic for register/login/me
├── middleware/
│   ├── auth.js                ← checks "is this person logged in / allowed?"
│   └── errorHandler.js        ← catches errors and sends clean responses
└── routes/
    └── authRoutes.js           ← connects URLs (like /api/auth/login) to
                                   the controller functions above
```

Each folder has its own `README.md` that goes deeper into that folder's
code — this file is just the big picture.

---

## 2. Why the code is split into these folders (the "layers")

Think of a request travelling through layers, like a factory assembly
line. Each layer does ONE job and passes the work to the next layer:

```
Request comes in
      │
      ▼
routes/           "which URL is this? which function should handle it?"
      │
      ▼
middleware/        "is this person allowed to do this?" (optional layer)
      │
      ▼
controllers/       "do the actual work" (talk to the database, decide what
                    to send back)
      │
      ▼
models/            "how is data shaped, and how do we save/read it?"
      │
      ▼
MongoDB (the database itself)
```

Why split it like this instead of writing everything in one file?

- **Each file has ONE job.** If login is broken, you know to look in
  `authController.js`. You don't have to read 500 lines to find the bug.
- **Reusable pieces.** `authenticate` (in `middleware/auth.js`) will be
  reused by every future protected route (Notes, Subjects, Admin) — you
  write it once, use it everywhere.
- **Easier to test.** You can test "does password hashing work?" without
  needing Express or a real HTTP request, because the model logic is
  separate from the routing logic.

---

## 3. The full flow of a login request (step by step)

This is the most important part to understand — how one request travels
through all these files.

**Example: user sends `POST /api/auth/login` with `{ email, password }`**

1. **`server.js`** receives the request. It already ran `app.use('/api/auth', authRoutes)`,
   so it forwards anything starting with `/api/auth` to `routes/authRoutes.js`.

2. **`routes/authRoutes.js`** matches the exact path `/login`. Before running
   the real login logic, it first runs **validation rules**
   (`body('email').isEmail()`, etc.) and then `validateRequest` — if the
   email/password format is wrong, the request stops right here and a
   `422` error goes back. The controller never even runs.

3. **`controllers/authController.js` → `login()`** now runs:
   - Looks up the user by email in MongoDB, using `models/User.js`.
   - Compares the typed password against the stored (hashed) password.
   - If it matches, creates a JWT token (`signToken`).
   - Sends back `{ token, user }`.

4. If anything throws an unexpected error at any point, `next(error)` sends
   it to **`middleware/errorHandler.js`**, which turns it into a clean,
   consistent JSON response instead of crashing the server or leaking a
   raw stack trace to the user.

**Example: user sends `GET /api/auth/me` with `Authorization: Bearer <token>`**

1. `server.js` → `routes/authRoutes.js` matches `/me`.
2. Before the controller runs, **`middleware/auth.js` → `authenticate`**
   runs first (it's listed *before* `getMe` in the route definition). It
   checks the token is valid, and looks up the real user in MongoDB
   (fresh — not from the token itself, in case they got blocked since
   logging in). It attaches the result as `req.user`.
3. Only if that succeeds does **`getMe`** in `authController.js` run — and
   all it does is send back `req.user`, because `authenticate` already did
   the hard work.

This is why you'll see `authenticate` written *before* `getMe` in the route:
`router.get('/me', authenticate, getMe)`. **Order in that list matters —
Express runs them left to right, like a checklist.** If you swapped them,
`getMe` would run before we even know who the user is, and `req.user`
would be `undefined`.

---

## 4. Why the order of code INSIDE `server.js` matters

This is a common beginner trap. In Express, middleware and routes are
matched **in the order you write them**, top to bottom. So:

```js
dotenv.config();          // 1. MUST be first — everything below reads process.env values
app.use(cors());          // 2. Middleware — runs on every request, before routes
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);   // 3. Real routes

app.use((req, res) => { ... 404 ... });   // 4. MUST come AFTER all real routes
                                           //    — otherwise it would catch
                                           //    every request before your
                                           //    real routes get a chance

app.use(errorHandler);    // 5. MUST be last — Express only recognizes a
                           //    4-argument function (err, req, res, next)
                           //    as an error handler if nothing else has
                           //    already sent a response
```

If you moved the 404 handler above your routes, **every single request**
would get a 404, because Express stops at the first thing that matches —
and `app.use((req,res) => ...)` with no path matches *everything*.

---

## 5. What was fixed / completed in this pass

The folder you gave me had a good structure already, but several files
were unfinished or had small bugs that would stop the server from even
starting:

- `server.js` was cut off mid-file (import statement not finished) — rewritten completely.
- `config/db.js` had a hardcoded database name (`test`) instead of reading from `.env`.
- `models/User.js` had no password-hashing hook connected in a safe way, no role field, and no way to hide the password field from API responses.
- `controllers/authController.js` only had `register`, and it didn't hash passwords or return a token — `login` and `getMe` were missing entirely.
- `routes/authRoutes.js` had `export default authRoutes` but the variable was actually named `router` — this alone would have crashed the app on import.
- `middleware/auth.js` was an empty file.
- `middleware/errorHandler.js` didn't exist yet.
- `.env` was empty.
- `package.json` was missing `bcryptjs`, `cors`, `helmet`, and `express-validator` even though the code needs them.

I tested the final code by running `npm install` and starting the server —
it boots cleanly and fails only on `ECONNREFUSED` (because there's no
MongoDB running in this sandbox), which confirms all the imports and
wiring are correct.

---

## 6. How to run this for real

1. Make sure MongoDB is running (locally, or as a Docker container) and
   update `MONGO_URI` in `.env` to point to it.
2. Set a real `JWT_SECRET` in `.env` (any long random string).
3. Install and run:
   ```
   npm install
   npm run dev
   ```
4. Test with curl / Postman:
   ```
   POST http://localhost:5001/api/auth/register   { "name", "email", "password" }
   POST http://localhost:5001/api/auth/login      { "email", "password" }
   GET  http://localhost:5001/api/auth/me          (Authorization: Bearer <token>)
   ```

---

## 7. What's next (not built yet)

- Notes CRUD (create/read/update/delete notes)
- Subjects module
- Admin-only routes (using the `authorize('super_admin')` middleware that's
  already built and ready to use)
- Connecting this backend to the same Next.js frontend (it would need a
  toggle or separate API base URL, since you're running both MySQL and
  MongoDB backends side by side)
