import { jsonResponse, optionsResponse } from '../_shared/cors';
import { proxyGet } from '../_shared/proxy';
import { BACKEND_ORIGIN } from '../_shared/upstreams';

export const config = { runtime: 'edge' };

const UPSTREAM = `${BACKEND_ORIGIN}/api/public/trust-anchors`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);
  const search = new URL(req.url).search.replace(/^\?/, '');
  return proxyGet(UPSTREAM, search);
}
