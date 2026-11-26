// GET: everything the admin page needs (settings + all people), admins only.
import { route } from '../lib/handler.js';
import { requireAdmin } from '../lib/auth.js';
import { db, ensureSchema } from '../lib/db.js';

export default route({
  async GET(req, res) {
    await requireAdmin(req);
    await ensureSchema();
    const q = db();
    const [settingsRows, peopleRows] = await Promise.all([
      q`SELECT data FROM sig_settings WHERE id = 1`,
      q`SELECT id, data FROM sig_people ORDER BY created_at, id`,
    ]);
    res.json({
      settings: settingsRows[0]?.data ?? null,
      people: peopleRows.map((r) => ({ ...r.data, id: r.id })),
    });
  },
});
