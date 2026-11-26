// POST { settings, people }: restore from a backup file. Replaces settings; adds or updates
// people (matched by id) and never deletes anyone, so existing links keep working. Admins only.
import { route } from '../lib/handler.js';
import { requireAdmin, HttpError } from '../lib/auth.js';
import { db, ensureSchema, newId } from '../lib/db.js';
import { cleanPerson, cleanSettings } from '../lib/validate.js';

export default route({
  async POST(req, res) {
    const email = await requireAdmin(req);
    await ensureSchema();
    const { settings, people } = req.body || {};
    if (!settings || !Array.isArray(people) || people.length > 2000) throw new HttpError(400, 'That file is not a valid backup.');
    const q = db();
    const s = cleanSettings(settings);
    const existing = new Set((await q`SELECT id FROM sig_people`).map((r) => r.id));
    const statements = [
      q`INSERT INTO sig_settings (id, data, updated_by) VALUES (1, ${JSON.stringify(s)}::jsonb, ${email})
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    ];
    let added = 0, updated = 0;
    for (const p of people) {
      const data = JSON.stringify(cleanPerson(p));
      if (typeof p.id === 'string' && existing.has(p.id)) {
        updated++;
        statements.push(q`UPDATE sig_people SET data = ${data}::jsonb, updated_at = now(), updated_by = ${email} WHERE id = ${p.id}`);
      } else {
        added++;
        statements.push(q`INSERT INTO sig_people (id, data, updated_by) VALUES (${newId()}, ${data}::jsonb, ${email})`);
      }
    }
    await q.transaction(statements);
    res.json({ added, updated });
  },
});
