# Google OAuth Backend Practice

Node.js, TypeScript, Express, Google OAuth, and switchable PostgreSQL/MongoDB persistence.

## Structure

```txt
src/
  config/        env and database connections
  controllers/   Express request/response handlers
  middlewares/   Express middleware
  models/        PostgreSQL and MongoDB persistence
  routes/        Express route definitions
  services/      OAuth and auth business logic
  utils/         shared helpers
  server.ts      app entry point
```

## Environment

Copy `.env.example` to `.env` and fill in real values.

Use PostgreSQL:

```env
DB_TYPE=postgresql
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/oauth_practice
```

Use MongoDB:

```env
DB_TYPE=mongodb
MONGO_URI=mongodb://127.0.0.1:27017/oauth_practice
```

Shared OAuth values:

```env
PORT=4000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
JWT_SECRET=replace_this_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

## PostgreSQL Setup In pgAdmin

1. Open pgAdmin.
2. Expand `Servers`.
3. Expand your PostgreSQL server.
4. Right click `Databases`.
5. Click `Create` > `Database`.
6. Name it `oauth_practice`.
7. Click `Save`.
8. Click the `oauth_practice` database.
9. Right click it and open `Query Tool`.
10. Paste and run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(provider, provider_user_id)
);
```

## MongoDB Setup

For local MongoDB, set:

```env
DB_TYPE=mongodb
MONGO_URI=mongodb://127.0.0.1:27017/oauth_practice
```

Mongoose creates the `users` and `oauthaccounts` collections when the first Google login succeeds.

## Google Cloud Console

Create an OAuth client for a web application.

Authorized redirect URI:

```txt
http://localhost:4000/auth/google/callback
```

Copy the client ID and client secret into `.env`.

## Run

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:4000/auth/google
```

## Testing With Postman

Google OAuth login is browser-based because Google must show its login screen and redirect back with cookies.

For the best test, use the browser:

1. Start the server with `npm run dev`.
2. Open `http://localhost:4000/auth/google`.
3. Login with Google.
4. The backend callback should return JSON with `Google login successful`.
5. Watch the terminal logs to see the flow.

In Postman, you can test only the first redirect:

1. `GET http://localhost:4000/auth/google`
2. Turn off automatic redirects.
3. Send the request.
4. Inspect the `Location` header pointing to Google.
