# controllers/

## What's in here

One file: `authController.js`. This is where the actual **decisions** get
made — "is this login correct?", "should this registration succeed?",
"what do we send back?"

## What a "controller" is, in simple terms

If `routes/authRoutes.js` is a receptionist that says "you want to log in?
go to counter 3" — the controller IS counter 3. It does the real work.

Routes never touch the database directly, and models never decide what
HTTP status code to send. Controllers sit in between and connect the two.

## The three functions, one at a time

### `signToken(userId)` — a small helper, not a route itself

```js
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
```

A JWT (JSON Web Token) is like a signed ID card. It contains the user's
ID, and it's signed with a secret key (`JWT_SECRET`) that only the server
knows. The user carries this token around and sends it back on future
requests (`Authorization: Bearer <token>`). Because it's signed, the
server can verify nobody tampered with it, without needing to check the
database on every single request just to know "who is this."

This is pulled out into its own tiny function because both `register` and
`login` need to create a token in exactly the same way — writing it twice
would risk them drifting apart (e.g. someone changes the expiry time in
one place but forgets the other).

### `register(req, res, next)`

Order of steps, and why that order:

1. **Check if the email is already registered.**
   We could skip this and let MongoDB's `unique: true` index reject the
   duplicate automatically — but that error message would be a raw
   database error, not something nice to show a user. Checking first lets
   us control the exact message ("Email already registered.").

2. **Create the user.**
   We only pass `name`, `email`, `password` — we deliberately do NOT let
   the request body set `role`. If we did, anyone could send
   `{ "role": "super_admin" }` in their registration request and make
   themselves an admin. The schema's default (`role: 'user'`) protects us
   here, as long as the controller doesn't undo that protection by
   passing through whatever the client sent.

3. **Sign a token and respond.**
   We send the token back immediately after registering, so the user is
   logged in right away and doesn't have to submit the login form again
   right after signing up.

### `login(req, res, next)`

1. **Find the user by email, and explicitly include the password field**
   (`.select('+password')`) — remember, the schema hides it by default.
   We need the real hashed password here to compare against.

2. **Check credentials with one combined `if`:**
   ```js
   if (!user || !(await user.comparePassword(password))) {
     return res.status(401).json({ success: false, message: 'Invalid email or password.' });
   }
   ```
   Notice this sends the **exact same error message** whether the email
   doesn't exist at all, or the email exists but the password is wrong.
   This is intentional — if we said "email not found" vs "wrong password"
   as two different messages, an attacker could use that to figure out
   which emails are registered on your site, one guess at a time. Same
   message for both closes that gap.

3. **Check `is_blocked`.** Even a correct password shouldn't let a blocked
   user in.

4. **Update `last_login` and respond with a token.**

### `getMe(req, res)`

```js
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
```

This looks almost too simple — and that's on purpose. By the time this
function runs, `middleware/auth.js`'s `authenticate` has already:
- verified the token,
- fetched the fresh user from the database,
- checked they're not blocked,
- attached the result as `req.user`.

So `getMe` doesn't need to repeat any of that work — it just hands back
what's already been prepared. This is a common pattern: middleware does
the "gatekeeping" work, and the final controller function stays short and
only handles the "happy path."

## Why every function ends with `try { ... } catch (error) { next(error) }`

If something unexpected throws inside `try` (a database being
unreachable, a bug, anything), `catch` catches it and calls
`next(error)` — this hands the error off to
`middleware/errorHandler.js`, which is the ONE place in the whole app that
decides how errors get turned into HTTP responses.

Without this pattern, an unexpected error inside an `async` function
would either crash the whole server, or leave the request hanging forever
with no response at all — neither of which is what you want.
