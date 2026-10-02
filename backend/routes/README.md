# routes/

## What's in here

One file: `authRoutes.js`. This is the "map" — it says which URL maps to
which piece of logic.

## What a "route" is

A route is one line that says: "when a request with THIS method (GET/POST/etc)
and THIS path arrives, run THESE functions, in THIS order."

```js
router.post('/register', [validation rules], validateRequest, register);
```

Read left to right — this is a checklist that runs in order:
1. Is this a `POST` request to `/register`? If not, skip this rule entirely.
2. Run the validation rules (check the email looks like an email, password is long enough, etc).
3. Run `validateRequest` — if any rule above failed, stop here and send a 422.
4. Only if everything above passed, run `register` — the real logic.

## Why this file doesn't contain any real logic itself

Notice `authRoutes.js` never touches the database, never checks
passwords, never builds a JWT. It only imports functions from
`controllers/` and `middleware/`, and wires them to URLs. This is on
purpose — if you ever needed to change *how* login works, you'd only ever
touch `authController.js`. If you needed to change *which URL* triggers
login, you'd only touch this file. Keeping "what runs" separate from
"what it does" makes both easier to change independently.

## How this file connects to `server.js`

```js
// in server.js:
app.use('/api/auth', authRoutes);
```

This line means: "anything that starts with `/api/auth`, hand off to this
router, and let it figure out the rest of the path." That's why inside
`authRoutes.js` the paths are just `/register`, `/login`, `/me` — not
`/api/auth/register` — the `/api/auth` prefix is already handled one
level up, in `server.js`. This makes the router reusable: if you ever
wanted to mount the exact same routes under a different prefix, you
could, without editing this file at all.

## Each route, and why it's built the way it is

### `POST /register`
```js
router.post('/register', [ ...validation... ], validateRequest, register);
```
Validation runs before `register`, so the controller can always assume
`req.body.name/email/password` are already reasonably valid by the time
it runs — it doesn't need to re-check basic formatting itself. This keeps
the controller focused on business logic ("is this email already taken?")
instead of input format checking.

### `POST /login`
```js
router.post('/login', [ ...validation... ], validateRequest, login);
```
Same pattern. Note the validation here is lighter (just "is it a valid
email" and "is password present") — we deliberately do NOT re-check
password length/format rules on login. A user's actual password might not
match today's rules if it was set a while ago; login should only ever
check "does this match what's stored," not "does this look like a good
password."

### `GET /me`
```js
router.get('/me', authenticate, getMe);
```
This is the only route with `authenticate` in it, because it's the only
one that requires the user to already be logged in. `/register` and
`/login` are intentionally public — you can't require a token to log in,
that would be a chicken-and-egg problem.

## Why the ORDER of arguments in each route line matters

Express runs everything you list in a route definition **strictly left to
right**, and stops as soon as one of them sends a response without
calling `next()`. So:

- Validation rules → before → `validateRequest` → before → controller.
  (No point running the controller on bad data.)
- `authenticate` → before → controller.
  (No point running the controller for someone who isn't even logged in.)

If you accidentally reversed any of these — say, put `login` before
`validateRequest` — the validation would still run, but too late: the
controller would have already executed on bad data first.
