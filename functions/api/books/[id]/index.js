import { HttpError, json, readJson } from '../../../../src/lib/http.js';
import { bookMeta, ownedBook, chunkStatements, cleanThumb, clampDim, MAX_PAYLOAD } from '../../../../src/lib/books.js';

// Returns { book, payload } where payload is streamed through as raw JSON text (no re-parse).
export async function onRequestGet({ env, data, params }) {
  const book = await ownedBook(env, data.user.id, params.id, data.unlocked);
  const { results } = await env.DB.prepare('SELECT data FROM book_chunks WHERE book_id = ? ORDER BY idx').bind(book.id).all();
  const raw = results.map((r) => r.data).join('') || 'null';
  return new Response(`{"book":${JSON.stringify(bookMeta(book))},"payload":${raw}}`, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

// Save the drawing + refresh thumbnail.
export async function onRequestPut({ request, env, data, params }) {
  const book = await ownedBook(env, data.user.id, params.id, data.unlocked);
  const b = await readJson(request, MAX_PAYLOAD + 400000);
  if (!b.payload || typeof b.payload !== 'object' || !Array.isArray(b.payload.objs)) throw new HttpError(400, 'Invalid paintbook data');

  const text = JSON.stringify(b.payload);
  if (text.length > MAX_PAYLOAD) throw new HttpError(413, 'This paintbook is too large to save. Remove some images.');

  const now = Date.now();
  const name = String(b.name ?? book.name).trim().slice(0, 60) || book.name;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM book_chunks WHERE book_id = ?').bind(book.id),
    ...chunkStatements(env, book.id, text),
    env.DB.prepare('UPDATE books SET name = ?, thumb = ?, w = ?, h = ?, scroll = ?, size = ?, updated_at = ? WHERE id = ? AND user_id = ?')
      .bind(name, cleanThumb(b.thumb), clampDim(b.w ?? book.w), clampDim(b.h ?? book.h), b.scroll ? 1 : 0, text.length, now, book.id, data.user.id),
  ]);
  return json({ book: { id: book.id, updated: now } });
}

// Rename / favourite / archive. Does not change "updated".
export async function onRequestPatch({ request, env, data, params }) {
  const book = await ownedBook(env, data.user.id, params.id, data.unlocked);
  const b = await readJson(request);
  if (b.arch !== undefined) {
    if (!data.unlocked) throw new HttpError(403, 'Archive is locked');
    if (b.arch && !data.user.arch_hash) throw new HttpError(400, 'Set an archive password first');
  }
  const sets = [], vals = [];
  if (b.name !== undefined) { const n = String(b.name).trim().slice(0, 60); if (!n) throw new HttpError(400, 'Name required'); sets.push('name = ?'); vals.push(n); }
  if (b.title !== undefined) { sets.push('title = ?'); vals.push(String(b.title).trim().slice(0, 80)); }
  if (b.fav !== undefined) { sets.push('fav = ?'); vals.push(b.fav ? 1 : 0); }
  if (b.arch !== undefined) { sets.push('arch = ?'); vals.push(b.arch ? 1 : 0); }
  if (sets.length) await env.DB.prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).bind(...vals, book.id, data.user.id).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, data, params }) {
  const book = await ownedBook(env, data.user.id, params.id, data.unlocked);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM book_chunks WHERE book_id = ?').bind(book.id),
    env.DB.prepare('DELETE FROM books WHERE id = ? AND user_id = ?').bind(book.id, data.user.id),
  ]);
  return json({ ok: true });
}
