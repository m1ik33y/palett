import { HttpError, json, readJson } from '../../../src/lib/http.js';
import { newId } from '../../../src/lib/crypto.js';
import { bookMeta, META_COLS, clampDim, chunkStatements, MAX_BOOKS } from '../../../src/lib/books.js';

export async function onRequestGet({ request, env, data }) {
  const archived = new URL(request.url).searchParams.get('archived') === '1';
  if (archived && !data.unlocked) throw new HttpError(403, 'Archive is locked');
  let results;
  try {
    ({ results } = await env.DB.prepare(
      `SELECT ${META_COLS}, 0 AS shared FROM books WHERE user_id = ?1 AND arch = ?2
       UNION ALL
       SELECT ${META_COLS}, 1 AS shared FROM books WHERE ?2 = 0 AND arch = 0 AND id IN (SELECT book_id FROM book_members WHERE user_id = ?1)
       ORDER BY updated_at DESC`
    ).bind(data.user.id, archived ? 1 : 0).all());
  } catch (e) {
    // book_members table not created yet (migration 002 not run): fall back to own paintbooks only
    ({ results } = await env.DB.prepare(
      `SELECT ${META_COLS}, 0 AS shared FROM books WHERE user_id = ? AND arch = ? ORDER BY updated_at DESC`
    ).bind(data.user.id, archived ? 1 : 0).all());
  }
  return json({ books: results.map(bookMeta) });
}

export async function onRequestPost({ request, env, data }) {
  const b = await readJson(request);
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM books WHERE user_id = ?').bind(data.user.id).first();
  if (count.n >= MAX_BOOKS) throw new HttpError(403, `Limit of ${MAX_BOOKS} paintbooks reached.`);

  const name = String(b.name || '').trim().slice(0, 60) || 'Untitled';
  const title = String(b.title || '').trim().slice(0, 80);
  const w = clampDim(b.w), h = clampDim(b.h), scroll = b.scroll ? 1 : 0;
  const bg = /^#[0-9a-f]{6}$/i.test(b.bg) ? b.bg : '#ffffff';

  const id = newId(), now = Date.now();
  const payload = JSON.stringify({ objs: [], imgs: {}, bg, nid: 1, w, h, scroll });
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO books (id, user_id, name, title, fav, arch, w, h, scroll, thumb, size, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, '', ?, ?, ?)`
    ).bind(id, data.user.id, name, title, w, h, scroll, payload.length, now, now),
    ...chunkStatements(env, id, payload),
  ]);
  return json({ book: bookMeta({ id, name, title, fav: 0, arch: 0, w, h, scroll, thumb: '', created_at: now, updated_at: now }) }, 201);
}
