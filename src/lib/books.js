import { HttpError } from './http.js';

export const CHUNK = 600000;         // characters per D1 row (rows are capped at 2 MB)
export const MAX_PAYLOAD = 10000000; // characters per paintbook
export const MAX_BOOKS = 500;

export const bookMeta = (r) => ({
  id: r.id, name: r.name, title: r.title, fav: r.fav, arch: r.arch,
  w: r.w, h: r.h, scroll: r.scroll, thumb: r.thumb,
  created: r.created_at, updated: r.updated_at, shared: !!r.shared,
});

export const META_COLS = 'id, name, title, fav, arch, w, h, scroll, thumb, created_at, updated_at';

export const clampDim = (v) => Math.min(8000, Math.max(64, Math.round(Number(v)) || 64));

export const chunkStatements = (env, bookId, text) => {
  const out = [];
  for (let i = 0, n = 0; i < text.length || n === 0; i += CHUNK, n++) {
    out.push(env.DB.prepare('INSERT INTO book_chunks (book_id, idx, data) VALUES (?, ?, ?)')
      .bind(bookId, n, text.slice(i, i + CHUNK)));
  }
  return out;
};

export async function ownedBook(env, userId, id, unlocked = false) {
  const row = await env.DB.prepare(`SELECT ${META_COLS} FROM books WHERE id = ? AND user_id = ?`).bind(id, userId).first();
  if (!row) {
    // An invited collaborator can see the book but may not archive, rename, favourite, duplicate or delete it.
    const member = await env.DB.prepare('SELECT 1 AS ok FROM book_members WHERE book_id = ? AND user_id = ?').bind(id, userId).first();
    if (member) throw new HttpError(403, 'Only the owner can do that with a shared paintbook.');
    throw new HttpError(404, 'Paintbook not found');
  }
  if (row.arch && !unlocked) throw new HttpError(404, 'Paintbook not found');
  return row;
}

// Owner OR invited member. Archived books stay owner-only (and need the archive unlocked).
export async function accessibleBook(env, userId, id, unlocked = false) {
  const row = await env.DB.prepare(
    `SELECT ${META_COLS}, user_id FROM books b WHERE id = ?1 AND (user_id = ?2 OR EXISTS
       (SELECT 1 FROM book_members m WHERE m.book_id = b.id AND m.user_id = ?2))`
  ).bind(id, userId).first();
  if (!row) throw new HttpError(404, 'Paintbook not found');
  row.isOwner = row.user_id === userId;
  if (row.arch && (!row.isOwner || !unlocked)) throw new HttpError(404, 'Paintbook not found');
  return row;
}

export const cleanThumb = (t) =>
  typeof t === 'string' && t.startsWith('data:image/jpeg;base64,') && t.length < 250000 ? t : '';
