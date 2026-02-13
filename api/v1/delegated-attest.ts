import { optionsResponse } from '../_shared/cors';
import { proxyPost } from '../_shared/proxy';

export const config = { runtime: 'edge' };

const UPSTREAM = 'https://reputation.omatrust.org/api/eas/delegated-attest';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  const body = await req.text();
  return proxyPost(UPSTREAM, body);
}
