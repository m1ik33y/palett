import { HttpError, json, readJson, clientIp } from '../../../src/lib/http.js';
import { hashPassword, newId } from '../../../src/lib/crypto.js';
import { createSession, publicUser, rateLimit } from '../../../src/lib/auth.js';

export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  const name = String(b.name || '').trim();
  const password = String(b.password || '');

  if (!/^[A-Za-z0-9_.-]{3,24}$/.test(name)) throw new HttpError(400, 'Username must be 3–24 characters: letters, numbers, _ . -');
  if (password.length < 6 || password.length > 200) throw new HttpError(400, 'Password must be at least 6 characters.');
  if (b.agreed !== true) throw new HttpError(400, 'Please accept the Terms of Service and Privacy Policy.');

  await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600);

  const id = newId(), now = Date.now();
  const email = `${id}@users.local`; // legacy column, unused
  const nameLc = name.toLowerCase();
  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, name_lc, pw_hash, theme, tree_open, created_at, agreed_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
    ).bind(id, email, name, nameLc, await hashPassword(password), 'dark', now, now).run();
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new HttpError(409, 'That username is already taken.');
    throw e;
  }

  const cookie = await createSession(env, request, id);
  return json({ user: publicUser({ id, name, theme: 'dark', tree_open: 0 }) }, 201, { 'set-cookie': cookie });
}
