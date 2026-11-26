// PUT: replace brand settings, admins only.
import { route } from '../lib/handler.js';
import { requireAdmin } from '../lib/auth.js';
import { db, ensureSchema } from '../lib/db.js';
import { cleanSettings } from '../lib/validate.js';

export default route({
  async PUT(req, res) {
    const email = await requireAdmin(req);
    await ensureSchema();
    const data = cleanSettings(req.body || {});
    await db()`INSERT INTO sig_settings (id, data, updated_by) VALUES (1, ${JSON.stringify(data)}::jsonb, ${email})
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by`;
    res.json({ settings: data });
  },
});
