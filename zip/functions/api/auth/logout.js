import { json } from '../../../src/lib/http.js';
import { destroySession } from '../../../src/lib/auth.js';

export async function onRequestPost({ request, env }) {
  const cookie = await destroySession(env, request);
  return json({ ok: true }, 200, { 'set-cookie': cookie });
}
