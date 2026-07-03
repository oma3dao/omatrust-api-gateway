import { optionsResponse } from '../_shared/cors';
import { proxyPost } from '../_shared/proxy';
import { REGISTRY_ORIGIN } from '../_shared/upstreams';

export const config = { runtime: 'edge' };

const UPSTREAM = `${REGISTRY_ORIGIN}/api/controller-witness`;

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  const body = await req.text();
  return proxyPost(UPSTREAM, body);
}
