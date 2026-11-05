// Supabase Storage helpers (server side only: the service key never reaches the browser).
// Env: SUPABASE_URL (https://<ref>.supabase.co), SUPABASE_SERVICE_KEY (secret), SUPABASE_BUCKET (default "palett").
import { HttpError } from './http.js';

export const MEDIA_PREFIX = '/api/media/';
export const mediaUrl = (key) => (key ? MEDIA_PREFIX + key : null);

// books/<bookId>/<24 hex>.<ext>  |  avatars/<userId>/<24 hex>.<ext>
const KEY_RE = /^(books|avatars)\/[A-Za-z0-9]{1,40}\/[a-f0-9]{24}\.(png|jpg|webp|gif)$/;
export const validKey = (k) => KEY_RE.test(String(k || ''));
const MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
export const mimeFor = (key) => MIME[String(key).split('.').pop()];

// Decide the real type from the file's bytes (never trust the client's Content-Type).
export function sniffExt(b) {
  if (b.length > 12) {
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp';
  }
  return null;
}

export const newObjectName = (ext) => {
  const r = crypto.getRandomValues(new Uint8Array(12));
  return [...r].map((x) => x.toString(16).padStart(2, '0')).join('') + '.' + ext;
};

function cfg(env) {
  const base = String(env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = String(env.SUPABASE_SERVICE_KEY || '').trim();
  if (!/^https?:\/\/[^/]+$/.test(base) || /YOUR[-_]/i.test(base) || !key)
    throw new HttpError(503, 'Media storage is not configured yet (set SUPABASE_URL and SUPABASE_SERVICE_KEY).');
  const headers = { apikey: key };
  if (key.startsWith('eyJ')) headers.authorization = 'Bearer ' + key; // legacy JWT keys; new sb_secret_ keys use apikey only
  return { base, bucket: env.SUPABASE_BUCKET || 'palett', headers };
}
const objUrl = (c, key) => `${c.base}/storage/v1/object/${encodeURIComponent(c.bucket)}/${key}`;

async function fail(what, res) {
  let t = ''; try { t = (await res.text()).slice(0, 300); } catch {}
  console.error('Supabase', what, res.status, t);
  throw new HttpError(502, `Storage ${what} failed (${res.status}). ${t}`.trim());
}

export async function putObject(env, key, bytes, mime) {
  const c = cfg(env);
  const res = await fetch(objUrl(c, key), {
    method: 'POST', headers: { ...c.headers, 'content-type': mime, 'cache-control': 'max-age=31536000', 'x-upsert': 'false' }, body: bytes,
  });
  if (!res.ok) await fail('upload', res);
}

export async function getObject(env, key) {
  const c = cfg(env);
  const res = await fetch(objUrl(c, key), { headers: c.headers });
  if (res.status === 400 || res.status === 404) throw new HttpError(404, 'Not found');
  if (!res.ok) await fail('download', res);
  return res;
}

export async function deleteObject(env, key) {
  try {
    const c = cfg(env);
    const res = await fetch(objUrl(c, key), { method: 'DELETE', headers: c.headers });
    if (!res.ok) console.error('Supabase delete', res.status);
  } catch (e) { console.error('Supabase delete', e); }
}

export async function copyObject(env, from, to) {
  const c = cfg(env);
  const res = await fetch(`${c.base}/storage/v1/object/copy`, {
    method: 'POST', headers: { ...c.headers, 'content-type': 'application/json' },
    body: JSON.stringify({ bucketId: c.bucket, sourceKey: from, destinationKey: to }),
  });
  if (!res.ok) await fail('copy', res);
}
