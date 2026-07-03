# Trust Anchors — Spec

Status: Implemented

## Goal

Serve JSON trust anchors that the SDK and public clients use to validate OMA3-controlled trust roots. The response defines which EAS contracts, schemas, registries, and widget origins are authorized by OMA3.

## Protocol reference

The trust anchors response is consumed by the signing bridge defined in:

→ [omatrust-sdk/docs/features/widget-signing-bridge/spec.md](https://github.com/oma3dao/omatrust-sdk/blob/main/docs/features/widget-signing-bridge/spec.md)

## Endpoint

```
GET https://api.omatrust.org/v1/trust-anchors
```

`GET /v1/trust-policy` has been removed. All callers use `/v1/trust-anchors` directly.

### Response

```json
{
  "version": 1,
  "updatedAt": "2026-05-02T00:00:00Z",
  "widgetOrigins": [],
  "chains": {
    "66238": {
      "name": "OMAChain Testnet",
      "easContract": "0x8835AF90f1537777F52E482C8630cE4e947eCa32",
      "schemas": {
        "user-review": "0x7ab3...",
        "linked-identifier": "0x26e2...",
        "key-binding": "0x807b...",
        "controller-witness": "0xc814..."
      }
    }
  },
  "registries": [
    {
      "type": "approved-issuers",
      "issuers": [
        {
          "address": "0x6f05D46...",
          "label": "OMA3 Testnet Attestation",
          "schemas": ["security-assessment", "certification"]
        }
      ]
    }
  ]
}
```

### Fields

| Field            | Type     | Description                                                    |
|------------------|----------|----------------------------------------------------------------|
| `version`        | number   | Trust anchors response version. Increment on breaking changes.  |
| `updatedAt`      | string   | ISO 8601 timestamp of last update.                             |
| `widgetOrigins`  | string[] | Additional trusted origins beyond `*.omatrust.org`.            |
| `chains`         | object   | Chain ID → chain anchors mapping.                              |
| `chains.*.name`  | string   | Human-readable chain name.                                     |
| `chains.*.easContract` | string | EAS contract address on this chain.                      |
| `chains.*.schemas`     | object | Schema name → schema UID mapping.                        |
| `registries`     | object[] | OMA3-maintained trust registries, such as inline approved issuer lists. |

### CORS

All responses include `Access-Control-Allow-Origin: *`.

### Method

GET only. OPTIONS returns 204 with CORS headers. Other methods return 405.

## How the SDK uses it

1. `createSigningBridge` calls `fetchTrustAnchors()` on creation.
2. `extractAllowlists(anchors)` collects all contracts and schemas across chains
3. Origin trust is derived from the policy URL domain (`*.omatrust.org`) plus `widgetOrigins`
4. Every signing request is validated against these lists
5. Policy is cached for 5 minutes in the SDK

## Updating trust anchors

When new chains, contracts, or schemas are deployed:

1. Update the backend trust anchors source used by `/api/public/trust-anchors`
2. Increment `version` if the change is breaking
3. Update `updatedAt`
4. Deploy the backend, then the gateway alias if needed
5. SDK consumers pick up the change within 5 minutes (cache TTL)

## Acceptance Criteria

- [ ] `GET /v1/trust-anchors` returns valid JSON with version, chains, registries, and widgetOrigins
- [ ] Response includes CORS headers
- [ ] OPTIONS returns 204
- [ ] Non-GET methods return 405
- [ ] OMAchain Testnet chain config includes correct EAS contract and schema UIDs
- [ ] SDK can fetch and parse the response successfully
- [ ] Response is stable (no random changes between requests)

## Edge Cases

- New schema deployed but policy not updated → SDK rejects signing requests for that schema until policy is updated
- Trust anchors endpoint down → SDK's `createSigningBridge` throws, bridge does not start (fail closed)
- Stale cache → SDK fetches fresh after 5-minute TTL
