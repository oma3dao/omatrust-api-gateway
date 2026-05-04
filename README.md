# omatrust-api-gateway

Lightweight API gateway for `api.omatrust.org`. Routes public API requests to the appropriate backend services via Edge Function proxies. No business logic lives here.

## Architecture

```
Client → api.omatrust.org/v1/... → Edge Function proxy → backend services
```

Each route is a serverless Edge Function (`api/v1/*.ts`) that proxies requests to the upstream service using `fetch()` with `redirect: 'manual'`. This preserves the HTTP method across redirects — Vercel rewrites issue 302s that convert POST → GET per HTTP spec.

Shared helpers in `api/_shared/` handle CORS headers and the redirect-follow loop.

Product subdomains (`registry.omatrust.org`, `reputation.omatrust.org`) are human-facing frontends, not public API origins. All documented API endpoints use `api.omatrust.org/v1/` as the canonical base URL.

## Routes

| Public URL                | Backend                                           | Method |
|---------------------------|---------------------------------------------------|--------|
| `/v1/controller-witness`  | `registry.omatrust.org/api/controller-witness`    | POST   |
| `/v1/verify-and-attest`   | `registry.omatrust.org/api/verify-and-attest`     | POST   |
| `/v1/delegated-attest`    | `reputation.omatrust.org/api/eas/delegated-attest`| POST   |
| `/v1/nonce`               | `reputation.omatrust.org/api/eas/nonce`           | GET    |
| `/v1/trust-anchors`       | `preview.backend.omatrust.org/api/public/trust-anchors` | GET |
| `/v1/controller-endpoint-confirm` | `preview.backend.omatrust.org/api/public/controller-endpoint-confirm` | GET |
| `/v1/controller-confirm`  | `preview.backend.omatrust.org/api/public/controller-confirm` | GET |
| `/v1/identity-resolve`    | `preview.backend.omatrust.org/api/public/identity-resolve` | POST |

Compatibility aliases:

| Alias | Canonical route |
|-------|-----------------|
| `/v1/trust-policy` | `/v1/trust-anchors` |

All routes also handle OPTIONS preflight with 204 + CORS headers.

## Adding a Route

1. Create a new file in `api/v1/your-endpoint.ts`
2. Import the shared helpers and proxy to your upstream:

```ts
import { optionsResponse } from '../_shared/cors';
import { proxyPost } from '../_shared/proxy'; // or proxyGet

export const config = { runtime: 'edge' };

const UPSTREAM = 'https://your-backend.omatrust.org/api/your-endpoint';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();
  const body = await req.text();
  return proxyPost(UPSTREAM, body);
}
```

## Local Development

```bash
npx vercel dev
```

## Testing

After starting the dev server (or against production), verify each route:

```bash
# OPTIONS preflight — expect 204 with CORS headers
curl -X OPTIONS -i http://localhost:3001/v1/controller-witness

# POST routes — expect upstream JSON responses (not redirects or HTML)
curl -X POST http://localhost:3001/v1/controller-witness \
  -H "Content-Type: application/json" \
  -d '{"subject":"did:example:test","controller":"0x0000"}'

curl -X POST http://localhost:3001/v1/verify-and-attest \
  -H "Content-Type: application/json" \
  -d '{"test":true}'

curl -X POST http://localhost:3001/v1/delegated-attest \
  -H "Content-Type: application/json" \
  -d '{"test":true}'

# GET route — expect JSON with nonce value
curl "http://localhost:3001/v1/nonce?attester=0x0000000000000000000000000000000000000000"
```

POST routes should return upstream validation errors (JSON with error messages), not 302 redirects or HTML. That confirms the proxy is preserving the HTTP method.

## Deployment

Push to `main`. Vercel deploys automatically. Ensure `api.omatrust.org` is configured as a custom domain on the Vercel project.

## License and Participation

- Code is licensed under [MIT](./LICENSE)
- Contributor terms are defined in [CONTRIBUTING.md](./CONTRIBUTING.md)

**Licensing Notice**
This initial version (v1) is released under MIT to maximize transparency and adoption.

OMA3 may license future versions of this reference implementation under different terms (for example, the Business Source License, BSL) if forks or incompatible implementations threaten to fragment the ecosystem or undermine the sustainability of OMA3.

OMA3 standards (such as specifications and schemas) will always remain open and are governed by [OMA3's IPR Policy](https://www.oma3.org/intellectual-property-rights-policy).
