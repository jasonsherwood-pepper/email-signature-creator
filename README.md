# Pepper Signature Studio

Creates and hands out email signatures for hello pepper staff (hellopepper.com, Google Workspace).

Live: https://email-signature-creator-weld.vercel.app — Vercel team `hello-pepper`, project `email-signature-creator`. Every push to `main` deploys to production.

## How it works
- `web/index.html` — the whole UI (admin page and each person's signature page). No build step.
- `api/` — Vercel Functions. `lib/` — shared server code (database, auth, validation).
- **Data** lives in Neon Postgres (Vercel Marketplace resource `pepper-signatures`): tables `sig_settings` (brand settings) and `sig_people` (one row per person, details in JSONB). Tables are created automatically on first request.
- **Admins** sign in with Google. The server verifies the Google ID token, requires a verified `@hellopepper.com` account listed in `ADMIN_EMAILS`, then sets a 12-hour signed session cookie.
- **Personal links** are `/s/<id>`. The id is random and unguessable; the page always shows the latest saved details. Work email is only returned if it's shown in the signature.
- Signatures use tables and inline styles only, inside a white padded card, with Instrument Sans falling back to Arial.

## Environment variables (Vercel)
| Name | Purpose |
|---|---|
| `DATABASE_URL` | Set by the Neon integration |
| `GOOGLE_CLIENT_ID` | Google OAuth web client (Internal app). Authorized JavaScript origin: the production URL |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `SESSION_SECRET` | Random 32+ character secret that signs session cookies |
| `ALLOWED_DOMAIN` | Optional, defaults to `hellopepper.com` |

To add an admin: edit `ADMIN_EMAILS` in the Vercel project settings (all environments), then redeploy.

## Local development
`vercel env pull --yes` then `vercel dev`. Google sign-in only works on origins registered in the Google client, so add `http://localhost:3000` there if you need to sign in locally. Note: local dev uses the same database as production.

## Logo
`web/assets/logo.png` (400×69, transparent), shown at 160px wide. A custom logo URL must be a public https PNG.
