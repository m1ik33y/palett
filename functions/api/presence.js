import { HttpError, json } from '../../src/lib/http.js';

const ONLINE_MS = 35000;

export async function onRequestPost({ env, data }) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO presence (user_id, last_seen) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET last_seen = excluded.last_seen`
  ).bind(data.user.id, now).run();
  return json({ ok: true, online: true, lastSeen: now });
}

export async function onRequestGet({ env, data, request }) {
  const raw = new URL(request.url).searchParams.get('ids') || '';
  const ids = [...new Set(raw.split(',').map(x => x.trim()).filter(Boolean))].slice(0, 50);
  if (!ids.length) return json({ online: [] });
  const placeholders = ids.map(() => '?').join(',');
  const cutoff = Date.now() - ONLINE_MS;
  const { results } = await env.DB.prepare(
    `SELECT user_id FROM presence WHERE last_seen >= ? AND user_id IN (${placeholders})`
  ).bind(cutoff, ...ids).all();
  return json({ online: results.map(r => r.user_id) });
}
