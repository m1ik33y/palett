import { json } from '../../../src/lib/http.js';

export async function onRequestGet({ data }) {
  return json({ hasPassword: !!data.user.arch_hash, unlocked: data.unlocked, expiresAt: data.unlocked ? data.user.arch_until : null });
}
