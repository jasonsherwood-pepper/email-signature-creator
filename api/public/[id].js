// GET: one person's signature data for their personal link (/s/<id>). Public, read-only;
// the unguessable id is the access key. Work email is withheld unless shown in the signature.
import { route } from '../../lib/handler.js';
import { HttpError } from '../../lib/auth.js';
import { db, ensureSchema } from '../../lib/db.js';
import { publicPerson } from '../../lib/validate.js';

export default route({
  async GET(req, res) {
    const id = String(req.query.id || '');
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) throw new HttpError(404, 'Not found.');
    await ensureSchema();
    const q = db();
    const [person] = await q`SELECT data FROM sig_people WHERE id = ${id}`;
    if (!person) throw new HttpError(404, 'Not found.');
    const [settings] = await q`SELECT data FROM sig_settings WHERE id = 1`;
    res.setHeader('X-Robots-Tag', 'noindex');
    res.json({ person: publicPerson(person.data), settings: settings?.data ?? null });
  },
});
