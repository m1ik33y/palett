const enc = new TextEncoder();
const ITER = 100000; // Workers' WebCrypto caps PBKDF2 at 100,000 iterations

const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt, ITER);
  return `pbkdf2$${ITER}$${toB64(salt)}$${toB64(bits)}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, iter, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'pbkdf2') return false;
  const bits = new Uint8Array(await derive(password, fromB64(salt), Number(iter)));
  const want = fromB64(hash);
  if (bits.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ want[i]; // constant-time compare
  return diff === 0;
}

export const randomToken = () => toHex(crypto.getRandomValues(new Uint8Array(32)));
export const sha256Hex = async (s) => toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
export const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

// Hash of a throwaway password so unknown emails cost the same time as known ones.
export const DUMMY_HASH = 'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
