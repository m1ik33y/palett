import { HttpError, json } from '../../../../src/lib/http.js';
import { newId } from '../../../../src/lib/crypto.js';
import { bookMeta, ownedBook, chunkStatements, MAX_BOOKS } from '../../../../src/lib/books.js';
import { copyObject, newObjectName, MEDIA_PREFIX } from '../../../../src/lib/supabase.js';

export async function onRequestPost({ env, data, params }) {
  const src = await ownedBook(env, data.user.id, params.id, data.unlocked);
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM books WHERE user_id = ?').bind(data.user.id).first();
  if (count.n >= MAX_BOOKS) throw new HttpError(403, `Limit of ${MAX_BOOKS} paintbooks reached.`);

  const id = newId(), now = Date.now(), name = `${src.name} copy`.slice(0, 60);
  const meta = env.DB.prepare(
    `INSERT INTO books (id, user_id, name, title, fav, arch, w, h, scroll, thumb, size, created_at, updated_at)
     SELECT ?, user_id, ?, title, 0, arch, w, h, scroll, thumb, size, ?, ? FROM books WHERE id = ? AND user_id = ?`
  ).bind(id, name, now, now, src.id, data.user.id);

  // Image attachments live in the storage bucket under the source canvas: give the copy its own files.
  const { results } = await env.DB.prepare('SELECT data FROM book_chunks WHERE book_id = ? ORDER BY idx').bind(src.id).all();
  let text = results.map((r) => r.data).join('');
  const re = new RegExp(MEDIA_PREFIX.replace(/\//g, '\\/') + 'books\\/' + src.id + '\\/([a-f0-9]{24}\\.(?:png|jpg|webp|gif))', 'g');
  const names = [...new Set([...text.matchAll(re)].map((m) => m[1]))];
  if (names.length) {
    try {
      const map = {};
      for (const n of names) { map[n] = newObjectName(n.split('.').pop()); await copyObject(env, `books/${src.id}/${n}`, `books/${id}/${map[n]}`); }
      text = text.replace(re, (_, n) => `${MEDIA_PREFIX}books/${id}/${map[n]}`);
      await env.DB.batch([meta, ...chunkStatements(env, id, text), env.DB.prepare('UPDATE books SET size = ? WHERE id = ?').bind(text.length, id)]);
      return json({ book: bookMeta({ ...src, id, name, fav: 0, created_at: now, updated_at: now }) }, 201);
    } catch (e) { console.error('duplicate: media copy failed, sharing originals', e); }
  }
  await env.DB.batch([
    meta,
    env.DB.prepare('INSERT INTO book_chunks (book_id, idx, data) SELECT ?, idx, data FROM book_chunks WHERE book_id = ?').bind(id, src.id),
  ]);
  return json({ book: bookMeta({ ...src, id, name, fav: 0, created_at: now, updated_at: now }) }, 201);
}
