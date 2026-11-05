import { HttpError, json, readJson, clientIp } from '../../../src/lib/http.js';
import { verifyPassword, DUMMY_HASH } from '../../../src/lib/crypto.js';
import { createSession, publicUser, rateLimit, clearLimit } from '../../../src/lib/auth.js';

export async function onRequestPost({ request, env }) {
  const b = await readJson(request);
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  if (!email || !password || password.length > 200) throw new HttpError(400, 'Enter your email and password.');

  const key = `login:${clientIp(request)}:${email}`;
  await rateLimit(env, key, 10, 900);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  const ok = await verifyPassword(password, user ? user.pw_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, 'Incorrect email or password.');

  await clearLimit(env, key);
  const cookie = await createSession(env, request, user.id);
  return json({ user: publicUser(user) }, 200, { 'set-cookie': cookie });
}
