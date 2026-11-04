import { randomToken, sha256Hex } from './crypto.js';
import { HttpError } from './http.js';

const COOKIE = 'palett_session';
const SESSION_MS = 30 * 24 * 3600 * 1000;

export const publicUser = (u) => ({
  id: u.id, name: u.name, username: u.username, email: u.email, theme: u.theme, treeOpen: !!u.tree_open,
});

function readCookie(request, name) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

export function sessionCookie(request, token, maxAgeSec) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export async function createSession(env, request, userId) {
  const token = randomToken();
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256Hex(token), userId, now, now + SESSION_MS),
  ]);
  return sessionCookie(request, token, SESSION_MS / 1000);
}

export async function getSessionUser(env, request) {
  const token = readCookie(request, COOKIE);
  if (!token) return null;
  return env.DB.prepare(
    `SELECT u.*, s.id AS session_id, s.arch_until FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ?`
  ).bind(await sha256Hex(token), Date.now()).first();
}

export async function destroySession(env, request) {
  const token = readCookie(request, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(await sha256Hex(token)).run();
  return sessionCookie(request, '', 0);
}

// Fixed-window rate limit, one atomic statement (safe against parallel bursts). Throws 429 when exceeded.
export async function rateLimit(env, key, max, windowSec) {
  const now = Date.now(), reset = now + windowSec * 1000;
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN reset_at < ? THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at < ? THEN ? ELSE reset_at END
     RETURNING count`
  ).bind(key, reset, now, now, reset).first();
  if (row.count > max) throw new HttpError(429, 'Too many attempts. Please try again later.');
}
export const clearLimit = (env, key) => env.DB.prepare('DELETE FROM rate_limits WHERE key = ?').bind(key).run();
export const refundLimit = (env, key) => env.DB.prepare('UPDATE rate_limits SET count = MAX(count - 1, 0) WHERE key = ?').bind(key).run();
