import { HttpError, json, readJson } from '../../../../src/lib/http.js';
import { accessibleBook } from '../../../../src/lib/books.js';

async function listMembers(env, book) {
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.name, u.username, 1 AS owner, 0 AS ord FROM users u WHERE u.id = ?1
     UNION ALL
     SELECT u.id, u.name, u.username, 0, m.added_at FROM book_members m JOIN users u ON u.id = m.user_id WHERE m.book_id = ?2
     ORDER BY ord`
  ).bind(book.user_id, book.id).all();
  return results.map((r) => ({ id: r.id, name: r.name, username: r.username, owner: !!r.owner }));
}

export async function onRequestGet({ env, data, params }) {
  const book = await accessibleBook(env, data.user.id, params.id, data.unlocked);
  return json({ members: await listMembers(env, book), isOwner: book.isOwner });
}

// Invite by unique username (case-insensitive).
export async function onRequestPost({ request, env, data, params }) {
  const book = await accessibleBook(env, data.user.id, params.id, data.unlocked);
  if (!book.isOwner) throw new HttpError(403, 'Only the owner can invite people.');
  const b = await readJson(request);
  const q = String(b.username || '').trim().replace(/^@/, '');
  if (!q) throw new HttpError(400, 'Enter a username.');

  const u = await env.DB.prepare('SELECT id, name FROM users WHERE username = ? COLLATE NOCASE').bind(q).first();
  if (!u) throw new HttpError(404, 'No user with that username.');
  if (u.id === book.user_id) throw new HttpError(400, 'That is the owner.');

  const res = await env.DB.prepare('INSERT OR IGNORE INTO book_members (book_id, user_id, added_at) VALUES (?, ?, ?)')
    .bind(book.id, u.id, Date.now()).run();
  if (!res.meta.changes) throw new HttpError(409, u.name + ' is already on this canvas.');
  return json({ members: await listMembers(env, book) }, 201);
}

// Owner removes someone, or a collaborator leaves (userId = themselves).
export async function onRequestDelete({ request, env, data, params }) {
  const book = await accessibleBook(env, data.user.id, params.id, data.unlocked);
  const uid = new URL(request.url).searchParams.get('user');
  if (!uid) throw new HttpError(400, 'Missing user');
  if (!book.isOwner && uid !== data.user.id) throw new HttpError(403, 'Not allowed');
  await env.DB.prepare('DELETE FROM book_members WHERE book_id = ? AND user_id = ?').bind(book.id, uid).run();
  return json({ members: await listMembers(env, book) });
}
