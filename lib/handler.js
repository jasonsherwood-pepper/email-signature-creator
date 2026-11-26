// Wraps an API handler: method routing, JSON errors, no leaking of internal error text.
import { HttpError } from './auth.js';

export function route(methods) {
  return async (req, res) => {
    const fn = methods[req.method];
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '));
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) return res.status(e.status).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  };
}
