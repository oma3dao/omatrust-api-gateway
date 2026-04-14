# Trust Policy — Spec

Status: Implemented

## Goal

Serve a JSON trust policy that the SDK uses to validate widget signing requests. The policy defines which EAS contracts, schemas, and widget origins are authorized by OMA3.

## Protocol reference

The trust policy is consumed by the signing bridge defined in:

→ [omatrust-sdk/docs/features/widget-signing-bridge/spec.md](https://github.com/oma3dao/omatrust-sdk/blob/main/docs/features/widget-signing-bridge/spec.md)

## Endpoint

```
GET https://api.omatrust.org/v1/trust-policy
```

### Response

```json
{
  "version": 1,
  "updatedAt": "2026-04-13T00:00:00Z",
  "widgetOrigins": [],
  "chains": {
    "66238": {
      "name": "OMAchain Testnet",
      "easContract": "0x8835AF90f1537777F52E482C8630cE4e947eCa32",
      "schemas": [
        "0x7ab3...",
        "0x26e2...",
        "0x807b...",
        "0xc814..."
      ]
    }
  }
}
```

### Fields

| Field            | Type     | Description                                                    |
|------------------|----------|----------------------------------------------------------------|
| `version`        | number   | Policy version. Increment on breaking changes.                 |
| `updatedAt`      | string   | ISO 8601 timestamp of last update.                             |
| `widgetOrigins`  | string[] | Additional trusted origins beyond `*.omatrust.org`.            |
| `chains`         | object   | Chain ID → chain policy mapping.                               |
| `chains.*.name`  | string   | Human-readable chain name.                                     |
| `chains.*.easContract` | string | EAS contract address on this chain.                      |
| `chains.*.schemas`     | string[] | Allowed schema UIDs on this chain.                       |

### CORS

All responses include `Access-Control-Allow-Origin: *`.

### Method

GET only. OPTIONS returns 204 with CORS headers. Other methods return 405.

## How the SDK uses it

1. `createSigningBridge` calls `fetchTrustPolicy()` on creation
2. `extractAllowlists(policy)` collects all contracts and schemas across chains
3. Origin trust is derived from the policy URL domain (`*.omatrust.org`) plus `widgetOrigins`
4. Every signing request is validated against these lists
5. Policy is cached for 5 minutes in the SDK

## Updating the policy

When new chains, contracts, or schemas are deployed:

1. Update the `TRUST_POLICY` object in `api/v1/trust-policy.ts`
2. Increment `version` if the change is breaking
3. Update `updatedAt`
4. Push to main — Vercel deploys automatically
5. SDK consumers pick up the change within 5 minutes (cache TTL)

## Acceptance Criteria

- [ ] `GET /v1/trust-policy` returns valid JSON with version, chains, and widgetOrigins
- [ ] Response includes CORS headers
- [ ] OPTIONS returns 204
- [ ] Non-GET methods return 405
- [ ] OMAchain Testnet chain config includes correct EAS contract and schema UIDs
- [ ] SDK can fetch and parse the response successfully
- [ ] Response is stable (no random changes between requests)

## Edge Cases

- New schema deployed but policy not updated → SDK rejects signing requests for that schema until policy is updated
- Policy endpoint down → SDK's `createSigningBridge` throws, bridge does not start (fail closed)
- Stale cache → SDK fetches fresh after 5-minute TTL
