# Google OAuth Backend Practice

Node.js, TypeScript, Express, PostgreSQL, and Google OAuth practice backend.

## 1. Environment

Copy `.env.example` to `.env` and fill in your real values.

```env
PORT=4000
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/oauth_practice
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
JWT_SECRET=replace_this_with_a_long_random_secret
FRONTEND_URL=http://localhost:3000
```

## 2. PostgreSQL Setup In pgAdmin

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

To view saved users:

```txt
oauth_practice -> Schemas -> public -> Tables -> users -> View/Edit Data
```

## 3. Google Cloud Console Setup

Create an OAuth client for a web application.

Authorized redirect URI:

```txt
http://localhost:4000/auth/google/callback
```

Copy the client ID and client secret into `.env`.

## 4. Run The Server

```bash
npm install
npm run dev
```

Open this URL in your browser:

```txt
http://localhost:4000/auth/google
```

## 5. Testing With Postman

Google OAuth login is browser-based because Google needs to show its login screen and redirect back with cookies.

Best beginner test:

1. Start the server with `npm run dev`.
2. Open `http://localhost:4000/auth/google` in a browser.
3. Login with your Google account.
4. The backend callback should return JSON:

```json
{
  "message": "Google login successful",
  "user": {}
}
```

5. Watch the terminal logs to understand each step.
6. Check pgAdmin to confirm the user was saved.

You can also test the first redirect in Postman:

1. Create a `GET` request.
2. URL: `http://localhost:4000/auth/google`
3. In Postman settings for that request, turn off automatic redirect following if you want to inspect the Google redirect URL.
4. Send the request.
5. You should receive a redirect response with a `Location` header pointing to Google.

Do not manually call `/auth/google/callback` unless you have a real `code` and matching `google_oauth_state` cookie from the login flow.

## 6. Expected Log Flow

```txt
[HTTP] GET /auth/google
[Auth Controller] GET /auth/google
[Auth Service] Creating OAuth state
[Google OAuth] Creating Google authorization URL
[Auth Controller] Redirecting browser to Google
[HTTP] GET /auth/google/callback
[Auth Controller] OAuth state is valid
[Google OAuth] Exchanging authorization code for tokens
[Google OAuth] Verifying Google ID token
[User Repository] Finding user by Google ID
[User Repository] Creating user with Google account
[Auth Service] Creating application JWT
[Auth Service] Login completed
```
