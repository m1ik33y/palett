import { HttpError, json, readJson } from '../../../src/lib/http.js';
import { rateLimit, clearLimit, refundLimit } from '../../../src/lib/auth.js';
import { ARCH_TTL, checkArchivePassword, hashArchive, verifyArchive } from '../../../src/lib/archive.js';

// POST { password, create? }
//  - checks the archive password on the server (bcrypt)
//  - first use (no password yet) with create:true sets it
//  - on success this session is unlocked for ARCH_TTL; the browser only gets { ok, expiresAt }
export async function onRequestPost({ request, env, data }) {
  const b = await readJson(request);
  const password = String(b.password || '');
  const user = data.user;
  if (!password) throw new HttpError(401, 'Password not found');

  // 10 tries / 15 min, and 30 failed tries / 24 h per account (successful tries are refunded from the daily count)
  const key = `arch:${user.id}`, day = `archd:${user.id}`;
  await rateLimit(env, key, 10, 900);
  await rateLimit(env, day, 30, 86400);

  let created = false;
  if (!user.arch_hash) {
    if (b.create !== true) throw new HttpError(401, 'Password not found');
    checkArchivePassword(password, { min: 6 });
    await env.DB.prepare('UPDATE users SET arch_hash = ? WHERE id = ?').bind(await hashArchive(env, password), user.id).run();
    created = true;
  } else {
    if (new TextEncoder().encode(password).length > 72) throw new HttpError(401, 'Password not found');
    const { ok, upgrade } = await verifyArchive(password, user.arch_hash);
    if (!ok) throw new HttpError(401, 'Password not found');
    if (upgrade) await env.DB.prepare('UPDATE users SET arch_hash = ? WHERE id = ?').bind(await hashArchive(env, password), user.id).run();
  }

  await clearLimit(env, key);
  await refundLimit(env, day);
  const expiresAt = Date.now() + ARCH_TTL;
  await env.DB.prepare('UPDATE sessions SET arch_until = ? WHERE id = ?').bind(expiresAt, user.session_id).run();
  return json({ ok: true, unlocked: true, expiresAt, created });
}
