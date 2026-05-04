import { optionsResponse } from '../_shared/cors';
import { proxyGet } from '../_shared/proxy';
import { REPUTATION_ORIGIN } from '../_shared/upstreams';

export const config = { runtime: 'edge' };

const UPSTREAM = `${REPUTATION_ORIGIN}/api/eas/nonce`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  const search = new URL(req.url).search.replace(/^\?/, '');
  return proxyGet(UPSTREAM, search);
}
