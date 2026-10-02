# config/

## What's in here

One file: `db.js`. Its only job is to connect to MongoDB.

## What `db.js` does

```js
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notes_saas';
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
```

- It reads the database address (`MONGO_URI`) from `.env`, so you never
  hardcode a real address inside the code. This means the same code can
  point to a local database on your machine, or a different one on a
  server, just by changing `.env` — no code change needed.
- `serverSelectionTimeoutMS: 5000` tells Mongoose "if you can't reach the
  database in 5 seconds, give up and tell me" — without this, a wrong or
  unreachable `MONGO_URI` would make the app hang silently for a long time
  with no error message, which is confusing to debug.
- If the connection fails, we call `process.exit(1)`. This shuts the
  whole app down immediately. That might look extreme, but it's on
  purpose: a backend with no working database is useless anyway — every
  single request would fail. It's better to fail loudly and immediately
  at startup than to let the app run and confuse you later with random
  500 errors on every request.

## Why this is a separate file (instead of being inside `server.js`)

- **Single responsibility.** This file only knows about "connecting to
  MongoDB." It doesn't know or care about Express, routes, or anything
  else.
- **Easy to swap later.** If you ever move to a different database setup
  (e.g. add connection pooling options, or point to MongoDB Atlas in the
  cloud), you only touch this one file.

## Why `server.js` calls this FIRST (before starting the Express server)

```js
const startServer = async () => {
  await connectDB();   // wait for this to finish first
  app.listen(PORT, ...);
};
```

If we started the Express server (`app.listen`) before the database was
ready, the app would technically be "running" and accepting requests, but
every request that needs the database (which is almost all of them) would
fail immediately. Waiting for `connectDB()` to finish first guarantees
that by the time your app says "🚀 Server running," it's actually ready to
handle real requests.
