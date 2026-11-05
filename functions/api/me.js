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
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(n)) throw new HttpError(400, 'Username must be 3–24 characters: letters, numbers, _ . -');
    const taken = await env.DB.prepare('SELECT id FROM users WHERE name_lc = ? AND id != ?').bind(n.toLowerCase(), data.user.id).first();
    if (taken) throw new HttpError(409, 'That username is already taken.');
    sets.push('name = ?', 'name_lc = ?'); vals.push(n, n.toLowerCase());
  }
  if (b.theme !== undefined) {
    if (!['dark', 'light', 'auto'].includes(b.theme)) throw new HttpError(400, 'Invalid theme');
    sets.push('theme = ?'); vals.push(b.theme);
  }
  if (b.treeOpen !== undefined) { sets.push('tree_open = ?'); vals.push(b.treeOpen ? 1 : 0); }
  if (sets.length) try { await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, data.user.id).run(); }
  catch (e) { if (String(e).includes('UNIQUE')) throw new HttpError(409, 'That username is already taken.'); throw e; }
  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(data.user.id).first();
  return json({ user: publicUser(row) });
}
