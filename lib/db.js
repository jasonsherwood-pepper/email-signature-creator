// Neon Postgres access. Lazily created so a missing DATABASE_URL fails per request, not at import.
import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'node:crypto';

let sql = null;
let schemaReady = null;

export function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    sql = neon(url);
  }
  return sql;
}

// Two small tables; person/settings fields live in JSONB so the shape matches the client.
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const q = db();
      await q`CREATE TABLE IF NOT EXISTS sig_settings (
        id integer PRIMARY KEY CHECK (id = 1),
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by text
      )`;
      await q`CREATE TABLE IF NOT EXISTS sig_people (
        id text PRIMARY KEY,
        data jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by text
      )`;
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

// Unguessable id; it doubles as the person's public signature link (/s/<id>).
export const newId = () => randomBytes(12).toString('base64url');
