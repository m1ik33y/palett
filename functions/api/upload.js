import { HttpError, json } from '../../src/lib/http.js';
import { publicUser, rateLimit } from '../../src/lib/auth.js';
import { accessibleBook } from '../../src/lib/books.js';
import { putObject, deleteObject, sniffExt, newObjectName, mimeFor, mediaUrl } from '../../src/lib/supabase.js';

const MAX_BOOK_IMG = 10 * 1024 * 1024;
const MAX_AVATAR = 2 * 1024 * 1024;

// POST /api/upload?kind=avatar            body = raw image bytes -> sets your profile picture
// POST /api/upload?kind=book&book=<id>    body = raw image bytes -> attachment for a canvas you own or were invited to
export async function onRequestPost({ request, env, data, waitUntil }) {
  const q = new URL(request.url).searchParams;
  const kind = q.get('kind');
  if (kind !== 'avatar' && kind !== 'book') throw new HttpError(400, 'Bad upload kind');
  const max = kind === 'avatar' ? MAX_AVATAR : MAX_BOOK_IMG;

  let prefix;
  if (kind === 'book') {
    const book = await accessibleBook(env, data.user.id, q.get('book') || '', data.unlocked);
    prefix = `books/${book.id}`;
  } else prefix = `avatars/${data.user.id}`;

  await rateLimit(env, `upload:${data.user.id}`, 120, 600);

  if ((Number(request.headers.get('content-length')) || 0) > max) throw new HttpError(413, 'Image is too large.');
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > max) throw new HttpError(413, 'Image is too large.');
  const ext = sniffExt(bytes);
  if (!ext) throw new HttpError(400, 'Only PNG, JPEG, WebP or GIF images are supported.');

  const key = `${prefix}/${newObjectName(ext)}`;
  await putObject(env, key, bytes, mimeFor(key));

  if (kind === 'book') return json({ key, url: mediaUrl(key) }, 201);

  const old = data.user.avatar;
  await env.DB.prepare('UPDATE users SET avatar = ? WHERE id = ?').bind(key, data.user.id).run();
  if (old && old !== key) waitUntil(deleteObject(env, old));
  return json({ user: publicUser({ ...data.user, avatar: key }) }, 201);
}

// DELETE /api/upload?kind=avatar -> remove your profile picture
export async function onRequestDelete({ request, env, data, waitUntil }) {
  if (new URL(request.url).searchParams.get('kind') !== 'avatar') throw new HttpError(400, 'Bad upload kind');
  const old = data.user.avatar;
  await env.DB.prepare('UPDATE users SET avatar = NULL WHERE id = ?').bind(data.user.id).run();
  if (old) waitUntil(deleteObject(env, old));
  return json({ user: publicUser({ ...data.user, avatar: null }) });
}
