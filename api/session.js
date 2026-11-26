// GET: who is signed in (+ public Google client id for the sign-in button)
// POST { credential }: exchange a Google ID token for a session cookie
// DELETE: sign out
import { route } from '../lib/handler.js';
import { verifyGoogleCredential, setSession, clearSession, sessionEmail, HttpError } from '../lib/auth.js';

export default route({
  async GET(req, res) {
    res.json({ email: await sessionEmail(req), googleClientId: process.env.GOOGLE_CLIENT_ID || null });
  },
  async POST(req, res) {
    if (req.headers['x-sig-admin'] !== '1') throw new HttpError(403, 'Bad request origin.');
    const credential = req.body?.credential;
    if (typeof credential !== 'string') throw new HttpError(400, 'Missing Google credential.');
    const email = await verifyGoogleCredential(credential);
    await setSession(res, email);
    res.json({ email });
  },
  async DELETE(req, res) {
    clearSession(res);
    res.json({ ok: true });
  },
});
