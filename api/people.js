// POST: add a person, admins only. Returns the stored person with its new id.
import { route } from '../lib/handler.js';
import { requireAdmin } from '../lib/auth.js';
import { db, ensureSchema, newId } from '../lib/db.js';
import { cleanPerson } from '../lib/validate.js';

export default route({
  async POST(req, res) {
    const email = await requireAdmin(req);
    await ensureSchema();
    const id = newId();
    const data = cleanPerson(req.body || {});
    await db()`INSERT INTO sig_people (id, data, updated_by) VALUES (${id}, ${JSON.stringify(data)}::jsonb, ${email})`;
    res.status(201).json({ person: { ...data, id } });
  },
});
