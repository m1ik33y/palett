import { HttpError } from './http.js';

export const CHUNK = 600000;         // characters per D1 row (rows are capped at 2 MB)
export const MAX_PAYLOAD = 10000000; // characters per paintbook
export const MAX_BOOKS = 500;

export const bookMeta = (r) => ({
  id: r.id, name: r.name, title: r.title, fav: r.fav, arch: r.arch,
  w: r.w, h: r.h, scroll: r.scroll, thumb: r.thumb,
  created: r.created_at, updated: r.updated_at, shared: r.shared ? 1 : 0,
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
  if (!row || (row.arch && !unlocked)) throw new HttpError(404, 'Paintbook not found');
  return row;
}

export const cleanThumb = (t) =>
  typeof t === 'string' && t.startsWith('data:image/jpeg;base64,') && t.length < 250000 ? t : '';

// Owner OR invited collaborator. Returns the row plus `isOwner`.
export async function accessibleBook(env, userId, id, unlocked = false) {
  const row = await env.DB.prepare(
    `SELECT ${META_COLS}, user_id FROM books WHERE id = ? AND (user_id = ? OR id IN (SELECT book_id FROM book_members WHERE user_id = ?))`
  ).bind(id, userId, userId).first();
  if (!row || (row.arch && row.user_id === userId && !unlocked) || (row.arch && row.user_id !== userId)) throw new HttpError(404, 'Paintbook not found');
  return { ...row, isOwner: row.user_id === userId };
}
