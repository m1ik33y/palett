import { HttpError, json, readJson } from '../../src/lib/http.js';
import { publicUser } from '../../src/lib/auth.js';

export async function onRequestGet({ data }) {
  return json({ user: publicUser(data.user) });
}

export async function onRequestPatch({ request, env, data }) {
  const b = await readJson(request);
  const sets = [], vals = [];
  if (b.name !== undefined) {
    const n = String(b.name).trim();
    if (!n || n.length > 24) throw new HttpError(400, 'Name must be 1–24 characters.');
    sets.push('name = ?'); vals.push(n);
  }
  if (b.theme !== undefined) {
    if (!['dark', 'light', 'auto'].includes(b.theme)) throw new HttpError(400, 'Invalid theme');
    sets.push('theme = ?'); vals.push(b.theme);
  }
  if (b.treeOpen !== undefined) { sets.push('tree_open = ?'); vals.push(b.treeOpen ? 1 : 0); }
  if (sets.length) await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, data.user.id).run();
  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(data.user.id).first();
  return json({ user: publicUser(row) });
}
