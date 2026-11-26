// Admin auth: Google Sign-In ID token -> verified server-side -> our own signed session cookie.
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';

const COOKIE = 'pss';
const SESSION_HOURS = 12;
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

const allowedDomain = () => (process.env.ALLOWED_DOMAIN || 'hellopepper.com').toLowerCase();
const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set (32+ chars)');
  return new TextEncoder().encode(s);
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Returns the verified admin email, or throws HttpError(403) with a reason a person can act on.
export async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new HttpError(500, 'Google sign-in is not configured yet (GOOGLE_CLIENT_ID missing).');
  let payload;
  try {
    ({ payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    }));
  } catch {
    throw new HttpError(401, 'Google sign-in could not be verified. Please try again.');
  }
  const email = String(payload.email || '').toLowerCase();
  if (!payload.email_verified || payload.hd !== allowedDomain() || !email.endsWith('@' + allowedDomain())) {
    throw new HttpError(403, `Only ${allowedDomain()} Google accounts can sign in.`);
  }
  if (!adminEmails().includes(email)) {
    throw new HttpError(403, `${email} isn't on the admin list. Ask an existing admin to add you.`);
  }
  return email;
}

export async function setSession(res, email) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
  res.setHeader('Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}

// Session email if the cookie is valid AND the person is still on the admin list; otherwise null.
export async function sessionEmail(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    const email = String(payload.email || '').toLowerCase();
    return adminEmails().includes(email) ? email : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(req) {
  const email = await sessionEmail(req);
  if (!email) throw new HttpError(401, 'Please sign in.');
  // Writes must come from our own page (custom header can't be sent cross-site without CORS).
  if (req.method !== 'GET' && req.headers['x-sig-admin'] !== '1') throw new HttpError(403, 'Bad request origin.');
  return email;
}
