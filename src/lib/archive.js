import bcrypt from 'bcryptjs';
import { HttpError } from './http.js';
import { verifyPassword } from './crypto.js';

export const ARCH_TTL = 7000; // the unlock token lives 7 seconds and is never extended; after that the password is needed again

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
