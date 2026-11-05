import { HttpError, json, readJson } from '../../../../src/lib/http.js';
import { accessibleBook } from '../../../../src/lib/books.js';

export async function onRequestGet({ env, data, params, request }) {
  const book = await accessibleBook(env, data.user.id, params.id, data.unlocked);
  const url = new URL(request.url);
  // A lightweight authenticated heartbeat used to detect stale/dead connections.
  if (url.searchParams.get('ping') === '1') return json({ pong: true, now: Date.now() });
  const since = Math.max(0, Number(url.searchParams.get('since')) || 0);
  const row = await env.DB.prepare(
    'SELECT client_id, state, updated_at FROM book_live WHERE book_id = ?'
  ).bind(book.id).first();
  if (!row || row.updated_at <= since) return json({ state: null, updatedAt: row?.updated_at || 0 });
  // On first load, a live snapshot older than the saved paintbook is stale: the saved copy wins.
  if (since === 0 && row.updated_at < book.updated_at) return json({ state: null, updatedAt: row.updated_at });
  let state;
  try { state = JSON.parse(row.state); } catch { throw new HttpError(500, 'Live canvas state is invalid.'); }
  // Images are sent only when the client's image set differs (ik = hash of image keys).
  if (state.imgs && state.ik && state.ik === url.searchParams.get('ik')) delete state.imgs;
  return json({ state, clientId: row.client_id, updatedAt: row.updated_at });
}

export async function onRequestPost({ request, env, data, params }) {
  const book = await accessibleBook(env, data.user.id, params.id, data.unlocked);
  const b = await readJson(request, 1800000);
  if (!b.state || !Array.isArray(b.state.objs) || typeof b.state.bg !== 'string')
    throw new HttpError(400, 'Invalid live canvas state.');
  const clientId = String(b.clientId || '').slice(0, 80);
  if (b.state.imgs === undefined) { // unchanged images: keep the ones already stored
    const prev = await env.DB.prepare('SELECT state FROM book_live WHERE book_id = ?').bind(book.id).first();
    try { const ps = prev && JSON.parse(prev.state); if (ps && ps.imgs) b.state.imgs = ps.imgs; } catch {}
  }
  const state = JSON.stringify(b.state);
  // D1 rows have a 2 MB ceiling; leave room for row metadata.
  if (state.length > 1700000) throw new HttpError(413, 'This canvas is too large for live sync. Save normally instead.');
  const now = Date.now();
  // updated_at is a strictly increasing version, so a slow request can never hide a newer write.
  const row = await env.DB.prepare(
    `INSERT INTO book_live (book_id, client_id, state, updated_at) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(book_id) DO UPDATE SET client_id=excluded.client_id, state=excluded.state,
       updated_at=MAX(book_live.updated_at + 1, excluded.updated_at)
     RETURNING updated_at`
  ).bind(book.id, clientId, state, now).first();
  return json({ ok: true, updatedAt: row.updated_at });
}
