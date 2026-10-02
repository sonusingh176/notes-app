# models/

## What's in here

One file: `User.js`. It describes what a "User" looks like in the
database, and holds logic that's directly tied to a user (like password
hashing).

## What a "model" actually is

A model is a **blueprint**. It tells MongoDB (through Mongoose):
- What fields a User document has (`name`, `email`, `password`, `role`, etc.)
- What type each field is (String, Boolean, Date...)
- What rules each field must follow (required? unique? min length?)
- Any special behavior that should automatically happen around this data
  (like hashing a password before saving it)

Once this blueprint exists, the rest of the app (controllers) can do
things like `User.create(...)` or `User.findOne(...)` without having to
know any MongoDB-specific query details — Mongoose handles that using the
blueprint.

## Field-by-field, why each one exists

| Field        | Why |
|--------------|-----|
| `name`       | Required, trimmed, 2–100 characters — basic sanity limits so someone can't submit an empty or absurdly long name. |
| `email`      | Required, unique, lowercased automatically. Lowercasing matters because otherwise `User@mail.com` and `user@mail.com` would be treated as two different accounts, which is confusing and a security gap. |
| `password`   | `select: false` — this is important. It means normal queries (like `User.find()`) will NOT include the password field at all, even the hashed version. You have to explicitly ask for it (`.select('+password')`) when you really need it, like during login. This is a safety net: even if a developer forgets to strip the password before sending a response, it simply won't be there. |
| `role`       | `enum: ['user', 'super_admin']`, defaults to `'user'`. This controls what a person is allowed to do (see `middleware/auth.js`'s `authorize` function). |
| `is_blocked` | Lets an admin disable an account without deleting it. Checked both at login and on every authenticated request. |
| `last_login` | Just a timestamp, useful for admin dashboards later (e.g. "show inactive users"). |

## Why `role` is a plain string here, but was a separate table in the SQL version

In the MySQL/Sequelize version, `Role` is its own table, linked to `User`
by a foreign key (`role_id`). That makes sense in a relational database,
where you're taught to avoid repeating the same data in multiple places.

In MongoDB, documents are meant to be **self-contained** — you generally
avoid extra "joins" unless the related data is genuinely complex or
reused heavily elsewhere. Since there are only ever 2 possible roles, and
nothing else needs to reference "a role" as its own object, a simple
`enum` string field does the same job with far less complexity. This is a
deliberate design difference between the two versions, not a mistake —
it's "the MongoDB way" of solving the same problem.

## The password hashing hook — how and why

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

- `pre('save', ...)` means: "run this function right before any document
  from this model gets saved to the database."
- We use this instead of hashing the password manually inside the
  controller, because it guarantees the password is **always** hashed no
  matter which part of the code calls `.save()` or `.create()` — you
  can't accidentally forget it in some new feature you add later.
- `if (!this.isModified('password')) return next();` is a safety check.
  Without it, if a user only updates their `name`, this hook would still
  run and re-hash the *already-hashed* password — turning it into
  gibberish and permanently locking them out. This line makes sure we
  only hash when the password itself actually changed.

## `comparePassword` — how login verification works

```js
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

You can never "un-hash" a password to check it — hashing is one-way on
purpose. Instead, `bcrypt.compare` re-hashes the password the user just
typed (using the same hidden salt stored inside the existing hash) and
checks if the two hashes match. If they do, the password was correct.

## `toJSON` transform — the second layer of password protection

```js
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});
```

Even though `select: false` already hides the password in most queries,
this is a second, independent safety net: any time a User document is
converted to JSON (which happens automatically when you do
`res.json({ user })`), this strips the password field if it's somehow
present. Two independent layers of protection here is intentional — if
one layer is ever bypassed by a mistake somewhere, the other still
catches it.
