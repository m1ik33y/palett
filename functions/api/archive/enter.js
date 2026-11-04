import { HttpError, json, readJson } from '../../../src/lib/http.js';
import { rateLimit } from '../../../src/lib/auth.js';
import { FOLDER_TTL, checkPass } from '../../../src/lib/archive.js';

// POST { pass } – trades the 7 s entry pass from /verify for a folder session on this login session.
export async function onRequestPost({ request, env, data }) {
  const b = await readJson(request);
  const user = data.user;
  await rateLimit(env, `archp:${user.id}`, 60, 900);
  if (!user.arch_hash || !(await checkPass(b.pass, user.session_id, user.arch_hash))) throw new HttpError(401, 'Password not found');
  const expiresAt = Date.now() + FOLDER_TTL;
  await env.DB.prepare('UPDATE sessions SET arch_until = ? WHERE id = ?').bind(expiresAt, user.session_id).run();
  return json({ ok: true, unlocked: true, expiresAt });
}
