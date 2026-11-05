import { HttpError, json, readJson, clientIp } from '../../../src/lib/http.js';
import { hashPassword, newId } from '../../../src/lib/crypto.js';
import { createSession, publicUser, rateLimit } from '../../../src/lib/auth.js';

export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');

  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new HttpError(400, 'Enter a valid email address.');
  if (!name || name.length > 24) throw new HttpError(400, 'Enter your name (max 24 characters).');
  if (password.length < 6 || password.length > 200) throw new HttpError(400, 'Password must be at least 6 characters.');
  if (b.agreed !== true) throw new HttpError(400, 'Please accept the Terms of Service and Privacy Policy.');

  await rateLimit(env, `signup:${clientIp(request)}`, 10, 3600);

  const id = newId(), now = Date.now();
  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, pw_hash, theme, tree_open, created_at, agreed_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)'
    ).bind(id, email, name, await hashPassword(password), 'dark', now, now).run();
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new HttpError(409, 'An account with this email already exists.');
    throw e;
  }

  const cookie = await createSession(env, request, id);
  return json({ user: publicUser({ id, name, email, theme: 'dark', tree_open: 0 }) }, 201, { 'set-cookie': cookie });
}
