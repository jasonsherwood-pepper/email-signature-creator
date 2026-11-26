// PUT: update a person; DELETE: remove them (their link stops working). Admins only.
import { route } from '../../lib/handler.js';
import { requireAdmin, HttpError } from '../../lib/auth.js';
import { db, ensureSchema } from '../../lib/db.js';
import { cleanPerson } from '../../lib/validate.js';

const idOf = (req) => {
  const id = String(req.query.id || '');
  if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) throw new HttpError(400, 'Invalid id.');
  return id;
};

export default route({
  async PUT(req, res) {
    const email = await requireAdmin(req);
    await ensureSchema();
    const id = idOf(req);
    const data = cleanPerson(req.body || {});
    const rows = await db()`UPDATE sig_people SET data = ${JSON.stringify(data)}::jsonb, updated_at = now(), updated_by = ${email}
      WHERE id = ${id} RETURNING id`;
    if (!rows.length) throw new HttpError(404, 'That person no longer exists.');
    res.json({ person: { ...data, id } });
  },
  async DELETE(req, res) {
    await requireAdmin(req);
    await ensureSchema();
    await db()`DELETE FROM sig_people WHERE id = ${idOf(req)}`;
    res.json({ ok: true });
  },
});
