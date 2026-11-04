import { json } from '../../../src/lib/http.js';

export async function onRequestPost({ env, data }) {
  await env.DB.prepare('UPDATE sessions SET arch_until = 0 WHERE id = ?').bind(data.user.session_id).run();
  return json({ ok: true, unlocked: false });
}
