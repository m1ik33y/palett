export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export async function readJson(request, max = 64 * 1024) {
  const len = Number(request.headers.get('content-length')) || 0;
  if (len > max) throw new HttpError(413, 'Request too large');
  const text = await request.text();
  if (text.length > max) throw new HttpError(413, 'Request too large');
  try { return JSON.parse(text); } catch { throw new HttpError(400, 'Invalid JSON'); }
}

export const clientIp = (request) => request.headers.get('cf-connecting-ip') || 'local';
