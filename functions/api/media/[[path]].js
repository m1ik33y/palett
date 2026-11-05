import { HttpError } from '../../../src/lib/http.js';
import { accessibleBook } from '../../../src/lib/books.js';
import { getObject, validKey, mimeFor } from '../../../src/lib/supabase.js';

// GET /api/media/<key>: streams a file from the private Supabase bucket after an access check.
//  - books/<id>/...   only the owner or invited members of that canvas
//  - avatars/<id>/... any signed-in user (collaborators see each other's pictures)
export async function onRequestGet({ env, data, params }) {
  const key = (Array.isArray(params.path) ? params.path : [params.path]).join('/');
  if (!validKey(key)) throw new HttpError(404, 'Not found');
  const [scope, id] = key.split('/');
  if (scope === 'books') await accessibleBook(env, data.user.id, id, data.unlocked);
  const obj = await getObject(env, key);
  return new Response(obj.body, {
    headers: {
      'content-type': mimeFor(key),
      'cache-control': 'private, max-age=31536000, immutable', // object names are random and never rewritten
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'",
    },
  });
}
