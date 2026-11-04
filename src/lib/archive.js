import bcrypt from 'bcryptjs';
import { HttpError } from './http.js';
import { verifyPassword, toHex } from './crypto.js';

// Two separate things:
//  1. ENTRY PASS  – issued after a correct password, valid ENTRY_TTL (7 s), signed and bound to this login session.
//     It can only be exchanged once for the folder session (POST /api/archive/enter); after 7 s it is useless.
//  2. FOLDER SESSION – opened by that exchange (sessions.arch_until). Archived paintbooks can be listed/opened/saved only while it
//     is open. It is closed instantly by Exit/Esc/leaving the page, and expires FOLDER_TTL after the last activity
//     (the open folder pings every 30 s, a closed or abandoned one runs out on its own).
export const ENTRY_TTL = 7000;
export const FOLDER_TTL = 2 * 60 * 1000;

const enc = new TextEncoder();
// HMAC key = the stored archive hash, which only the server/database has.
const macKey = (hash) => crypto.subtle.importKey('raw', enc.encode('archive-pass|' + hash), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function makePass(sessionId, hash) {
  const exp = Date.now() + ENTRY_TTL;
  const sig = await crypto.subtle.sign('HMAC', await macKey(hash), enc.encode(`${sessionId}|${exp}`));
  return { pass: `${exp}.${toHex(sig)}`, expiresAt: exp };
}

export async function checkPass(pass, sessionId, hash) {
  const [e, h] = String(pass || '').split('.');
  const exp = Number(e), now = Date.now();
  if (!exp || exp < now || exp > now + ENTRY_TTL || !/^[0-9a-f]{64}$/.test(h || '')) return false;
  const sig = Uint8Array.from(h.match(/../g), (x) => parseInt(x, 16));
  return crypto.subtle.verify('HMAC', await macKey(hash), sig, enc.encode(`${sessionId}|${exp}`)); // constant-time
}

// bcrypt only uses the first 72 bytes of a password, so longer ones are refused instead of silently truncated.
export function checkArchivePassword(pw, { min = 1 } = {}) {
  const bytes = new TextEncoder().encode(pw).length;
  if (bytes < min) throw new HttpError(400, `Use at least ${min} characters.`);
  if (bytes > 72) throw new HttpError(400, 'Use at most 72 characters.');
}

const cost = (env) => Math.min(12, Math.max(4, Number(env.BCRYPT_COST) || 10));
export const hashArchive = (env, pw) => bcrypt.hash(pw, cost(env));

// Returns { ok, upgrade } – upgrade=true when the stored hash is an old PBKDF2 one and should be re-hashed with bcrypt.
export async function verifyArchive(pw, stored) {
  try {
    if (String(stored).startsWith('pbkdf2$')) return { ok: await verifyPassword(pw, stored), upgrade: true };
    return { ok: await bcrypt.compare(pw, stored), upgrade: false };
  } catch { return { ok: false, upgrade: false }; }
}

export const isUnlocked = (user) => !!user && user.arch_until > Date.now();
