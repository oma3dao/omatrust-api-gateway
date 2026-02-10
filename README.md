# omatrust-api-gateway

Lightweight API gateway for `api.omatrust.org`. Routes public API requests to the appropriate backend services via Vercel rewrites. No business logic lives here.

## Architecture

```
Client → api.omatrust.org/v1/... → Vercel rewrites → backend services
```

Product subdomains (`registry.omatrust.org`, `reputation.omatrust.org`) are human-facing frontends, not public API origins. All documented API endpoints use `api.omatrust.org/v1/` as the canonical base URL.

## Routes

| Public URL | Backend | Status |
|---|---|---|
| `/v1/controller-witness` | `registry.omatrust.org/api/controller-witness` | Active |
| `/v1/verify-and-attest` | `registry.omatrust.org/api/verify-and-attest` | Active |
| `/v1/delegated-attest` | `reputation.omatrust.org/api/eas/delegated-attest` | Active |

## Adding a Route

Add a rewrite entry to `vercel.json`:

```json
{
  "source": "/v1/your-endpoint",
  "destination": "https://your-backend.omatrust.org/api/your-endpoint"
}
```

## Local Development

This project has no runtime code. To test rewrites locally:

```bash
npx vercel dev
```

## Deployment

Push to `main`. Vercel deploys automatically. Ensure `api.omatrust.org` is configured as a custom domain on the Vercel project.

## License and Participation

- Code is licensed under [MIT](./LICENSE)
- Contributor terms are defined in [CONTRIBUTING.md](./CONTRIBUTING.md)

**Licensing Notice**
This initial version (v1) is released under MIT to maximize transparency and adoption.

OMA3 may license future versions of this reference implementation under different terms (for example, the Business Source License, BSL) if forks or incompatible implementations threaten to fragment the ecosystem or undermine the sustainability of OMA3.

OMA3 standards (such as specifications and schemas) will always remain open and are governed by [OMA3's IPR Policy](https://www.oma3.org/intellectual-property-rights-policy).
