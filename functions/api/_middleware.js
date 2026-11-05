import { HttpError, json } from '../../src/lib/http.js';
import { getSessionUser } from '../../src/lib/auth.js';
import { FOLDER_TTL, isUnlocked } from '../../src/lib/archive.js';

const PUBLIC = new Set(['/api/auth/login', '/api/auth/signup', '/api/auth/logout']);

export async function onRequest({ request, env, next, data }) {
  try {
    if (!env.DB) throw new HttpError(500, 'D1 binding "DB" is not configured');
    const url = new URL(request.url);

    // CSRF defence on top of SameSite=Lax: cross-origin writes are refused.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const origin = request.headers.get('origin');
      if (origin && origin !== url.origin) throw new HttpError(403, 'Bad origin');
    }

    data.user = await getSessionUser(env, request);
    if (!PUBLIC.has(url.pathname) && !data.user) throw new HttpError(401, 'Not signed in');

    // Archive folder session lives on the server-side session row, never in the browser. Activity keeps it open; idling closes it.
    data.unlocked = isUnlocked(data.user);
    const now = Date.now();
    if (data.unlocked && data.user.arch_until - now < FOLDER_TTL - 30000) {
      await env.DB.prepare('UPDATE sessions SET arch_until = ? WHERE id = ?').bind(now + FOLDER_TTL, data.user.session_id).run();
    }
    return await next();
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error('API error', request.method, new URL(request.url).pathname, e && e.message || e);
    const m = String(e && e.message || e);
    // Most common cause after a deploy: the D1 database was never initialised or is missing a migration.
    if (/no such (table|column)/i.test(m)) return json({ error: 'Database is not set up yet. Run schema.sql and the migrations on the D1 database.' }, 500);
    return json({ error: 'Server error' }, 500);
  }
}
