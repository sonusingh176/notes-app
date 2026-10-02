# middleware/

## What "middleware" means

Middleware is any function that runs **in between** a request arriving
and a controller sending back a response. Every middleware function gets
`(req, res, next)`, and it must do one of two things:
- call `next()` to let the request continue to whatever comes after it, or
- send a response itself (`res.status(...).json(...)`) and NOT call
  `next()`, which stops the request right there.

Think of it as a series of checkpoints a request has to pass through
before it reaches its final destination (the controller).

## What's in here

- `auth.js` — checks WHO is making the request, and WHAT they're allowed to do.
- `errorHandler.js` — catches errors and validation failures, and turns them into clean responses.

---

## `auth.js` — two functions

### `authenticate`

This checks: **"Is there a valid, logged-in user making this request?"**

Order of steps inside it, and why:

1. **Read the `Authorization` header, expect `"Bearer <token>"`.**
   If it's missing or doesn't start with `"Bearer "`, stop immediately
   with a 401 — no point doing any more work if there's clearly no token.

2. **Verify the token** with `jwt.verify(token, JWT_SECRET)`.
   This checks the token's signature is valid AND it hasn't expired. If
   either check fails, this line throws — which is why the whole thing is
   wrapped in `try/catch`, and the `catch` block gives specific messages
   for `TokenExpiredError` vs `JsonWebTokenError`.

3. **Look up the user fresh from the database** using the ID stored
   inside the token — instead of trusting any user data that might have
   been inside the token itself.
   This matters: imagine a user gets blocked by an admin *after* they
   already logged in and got a token. If we only trusted the token's
   contents, that blocked user could keep using the app until their token
   expires (maybe 7 days later). By re-checking the database every time,
   a block takes effect on their very next request.

4. **Check `is_blocked`** on that fresh user.

5. **Attach `req.user = user`** and call `next()`.
   Every controller/middleware that runs after this can now simply read
   `req.user` without doing any of this work again.

### `authorize(...roles)`

This checks: **"Is this specific user ALLOWED to do this specific thing?"**

```js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden...' });
    }
    next();
  };
};
```

Notice this is a function that **returns** a function. That's why you use
it in a route like `authorize('super_admin')` — you're calling it with
the list of allowed roles, and it hands back a middleware function
customized for that check. This pattern (called a "higher-order
function") lets one piece of code work for any combination of roles,
instead of writing a separate `authorizeAdmin`, `authorizeUser`, etc. for
every case.

**This must always come AFTER `authenticate` in a route**, like:
```js
router.get('/admin-only', authenticate, authorize('super_admin'), someController)
```
`authorize` relies on `req.user` already existing — and only `authenticate`
sets that. If you put `authorize` first, `req.user` would be `undefined`,
and the check `!req.user` would always be true, blocking literally
everyone (including real admins).

---

## `errorHandler.js` — two functions

### `validateRequest`

Routes attach validation rules (from the `express-validator` package)
directly onto the route definition, like:
```js
body('email').isEmail()
```
These rules don't reject bad input by themselves — they just collect a
list of problems. `validateRequest` is the middleware that actually
checks that list and stops the request (with a `422` response) if
anything failed. It's placed right after the validation rules and right
before the controller, so bad input never even reaches the controller.

### `errorHandler`

This is Express's special **error-handling middleware** — you can tell
because it takes 4 parameters `(err, req, res, next)` instead of the
usual 3. Express specifically looks for a 4-argument function to treat as
an error handler.

It's registered LAST in `server.js`, after every route. Whenever any
controller calls `next(error)`, the request skips straight to this
function (skipping any other normal middleware in between).

Inside, it checks the type of error and gives a friendlier message for
common MongoDB/Mongoose problems:
- `code === 11000` → duplicate key (e.g. someone tried to register with
  an email that's already taken, but this got caught by the database
  itself rather than our manual check in the controller — a backup net).
- `name === 'ValidationError'` → the data didn't match the schema rules
  in `models/User.js`.
- `name === 'CastError'` → someone sent a badly-formatted ID (e.g. not a
  valid MongoDB ObjectId) somewhere that expected one.
- anything else → a generic 500 error, without leaking internal details
  to the user, while still logging the full error to the server console
  for you (the developer) to see.

## Why having ONE central error handler (instead of handling errors inside every controller) matters

Without this, every single controller function would need its own
repeated `try/catch` logic to figure out what kind of error occurred and
what status code to send — the exact same code copy-pasted everywhere,
and easy to get inconsistent over time (one route says "Email taken",
another says "Duplicate email", etc.). Centralizing it here means: one
place to fix, one consistent response format across the entire API,
forever — even for routes you haven't built yet.
