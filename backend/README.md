# LearnQuick Backend

LearnQuick supports manual email/password accounts and Google as an additional OAuth/OpenID Connect option. Both methods use the same MongoDB `User` collection, so a verified Google email safely links to an existing local account instead of creating a duplicate.

Microsoft and Apple are not exposed.

## 1. Install and configure

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Core `.env` variables:

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=a_long_random_secret
JWT_EXPIRE=7d
OAUTH_COOKIE_SECRET=a_different_long_random_secret
AUTH_COOKIE_DAYS=7
COOKIE_SAME_SITE=lax
GOOGLE_CLIENT_ID=your_google_web_client_id
GOOGLE_CLIENT_SECRET=your_google_web_client_secret
GEMINI_API_KEY=your_gemini_key
```

Use `COOKIE_SAME_SITE=none` on Render because the Vercel frontend and Render
API are cross-site. Production cookies are automatically marked `Secure`.
Keep `COOKIE_SAME_SITE=lax` for local development.

Generate each cookie/JWT secret separately:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 2. Configure Google as an additional option

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select your project.
2. Complete **Google Auth Platform > Branding** and **Audience**.
3. Under **Clients**, create a **Web application** OAuth client.
4. Add this exact local redirect URI:

```text
http://localhost:8000/api/auth/google/callback
```

5. Add the production equivalent when deploying:

```text
https://api.yourdomain.com/api/auth/google/callback
```

6. Put the generated ID and secret in the two Google `.env` variables, then restart the backend.

The callback must match exactly. See Google's [OpenID Connect guide](https://developers.google.com/identity/openid-connect/openid-connect) and [OAuth client instructions](https://support.google.com/cloud/answer/15549257).

## 3. Configure forgot/reset password email

Add SMTP settings:

```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password_or_app_password
EMAIL_FROM="LearnQuick <no-reply@yourdomain.com>"
```

Use port `587` with `SMTP_SECURE=false` for STARTTLS, or port `465` with `SMTP_SECURE=true`. Reset tokens are random, stored only as SHA-256 hashes, expire after one hour, and are cleared after use.

## 4. Start and test the backend first

```powershell
npm run dev
```

Wait for the MongoDB and server-started messages, then run:

```powershell
npm run test:auth
```

The automated test verifies registration, login, HttpOnly-cookie sessions, logout, password reset, password changes, Google linking beside an existing password, adding a password to a Google-only account, and the continued removal of Microsoft/Apple. Synthetic test users are deleted automatically.

## 5. Authentication routes

```text
GET  /api/auth/providers
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/google
GET  /api/auth/google/callback
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
GET  /api/auth/session
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/change-password
```

`/api/auth/microsoft` and `/api/auth/apple` return 404.

## 6. How account linking works

- Local passwords are bcrypt-hashed and never returned by the API.
- A Google account may link to an existing user only when Google marks the matching email as verified.
- The account records both `password` and `google` in `authProviders` when both are enabled.
- Provider tokens are never stored.
- A signed-in Google-only user can add a password from Profile Settings.
- A Google-only user can also use forgot-password to add email/password access after verifying control of the email inbox.
- OAuth uses authorization code flow, PKCE, `state`, and `nonce`.
- LearnQuick sessions use signed JWTs and HttpOnly cookies; bearer JWT compatibility remains.

## 7. Feedback routes

```text
POST /api/feedback
GET  /api/feedback/me
```

Both routes require authentication. The backend takes the user ID, name, and email from the verified session rather than the request body. Submissions are validated, rate limited, checked for rapid duplicates, and stored in the `feedback` MongoDB collection.

Run the feedback integration test after starting the backend:

```powershell
npm run test:feedback
```

## 8. Start and test the frontend

```powershell
cd ..\frontend
npm install
npm run dev
```

Use `VITE_API_URL=http://localhost:8000` in `frontend/.env`. Test manual registration, manual login, Google login, forgot/reset password, Profile Settings password change, refresh persistence, and logout.

Run the automated frontend checks:

```powershell
npm run lint
npm run build
npm run test:auth-ui
```

## Author

Farouk Oladega
