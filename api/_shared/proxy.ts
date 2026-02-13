import { jsonResponse } from './cors';

const MAX_REDIRECTS = 3;

/**
 * Proxy a POST request to an upstream URL, following redirects manually
 * to preserve the POST method (Vercel rewrites issue 302 → GET).
 */
export async function proxyPost(upstream: string, body: string): Promise<Response> {
  let url = upstream;
  let res: Response | undefined;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual',
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      url = location.startsWith('http') ? location : new URL(location, url).toString();
      continue;
    }
    break;
  }

  if (!res) {
    return jsonResponse({ error: 'No response from upstream' }, 502);
  }

  const ct = res.headers.get('content-type') || '';
  const status = res.status;

  if (ct.includes('application/json')) {
    const data = await res.json();
    return jsonResponse(data, status);
  }

  const text = await res.text();
  return jsonResponse({ error: `Upstream returned ${status}`, detail: text.slice(0, 200) }, status || 502);
}

/**
 * Proxy a GET request to an upstream URL, forwarding query parameters.
 */
export async function proxyGet(upstream: string, search: string): Promise<Response> {
  const url = search ? `${upstream}?${search}` : upstream;
  let res: Response | undefined;
  let target = url;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    res = await fetch(target, { redirect: 'manual' });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;
      target = location.startsWith('http') ? location : new URL(location, target).toString();
      continue;
    }
    break;
  }

  if (!res) {
    return jsonResponse({ error: 'No response from upstream' }, 502);
  }

  const ct = res.headers.get('content-type') || '';
  const status = res.status;

  if (ct.includes('application/json')) {
    const data = await res.json();
    return jsonResponse(data, status);
  }

  const text = await res.text();
  return jsonResponse({ error: `Upstream returned ${status}`, detail: text.slice(0, 200) }, status || 502);
}
