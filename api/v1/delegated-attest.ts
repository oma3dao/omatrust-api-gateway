import { optionsResponse } from '../_shared/cors';
import { proxyPost } from '../_shared/proxy';
import { REPUTATION_ORIGIN } from '../_shared/upstreams';

export const config = { runtime: 'edge' };

const UPSTREAM = `${REPUTATION_ORIGIN}/api/eas/delegated-attest`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  const body = await req.text();
  return proxyPost(UPSTREAM, body);
}
