import { jsonResponse, optionsResponse } from '../_shared/cors';
import { proxyPost } from '../_shared/proxy';
import { BACKEND_ORIGIN } from '../_shared/upstreams';

export const config = { runtime: 'edge' };

const UPSTREAM = `${BACKEND_ORIGIN}/api/public/identity-resolve`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  const body = await req.text();
  return proxyPost(UPSTREAM, body);
}
