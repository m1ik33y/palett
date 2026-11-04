import { HttpError, json } from '../../../../src/lib/http.js';
import { newId } from '../../../../src/lib/crypto.js';
import { bookMeta, ownedBook, MAX_BOOKS } from '../../../../src/lib/books.js';

export async function onRequestPost({ env, data, params }) {
  const src = await ownedBook(env, data.user.id, params.id, data.unlocked);
  const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM books WHERE user_id = ?').bind(data.user.id).first();
  if (count.n >= MAX_BOOKS) throw new HttpError(403, `Limit of ${MAX_BOOKS} paintbooks reached.`);

  const id = newId(), now = Date.now(), name = `${src.name} copy`.slice(0, 60);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO books (id, user_id, name, title, fav, arch, w, h, scroll, thumb, size, created_at, updated_at)
       SELECT ?, user_id, ?, title, 0, arch, w, h, scroll, thumb, size, ?, ? FROM books WHERE id = ? AND user_id = ?`
    ).bind(id, name, now, now, src.id, data.user.id),
    env.DB.prepare('INSERT INTO book_chunks (book_id, idx, data) SELECT ?, idx, data FROM book_chunks WHERE book_id = ?').bind(id, src.id),
  ]);
  return json({ book: bookMeta({ ...src, id, name, fav: 0, created_at: now, updated_at: now }) }, 201);
}
