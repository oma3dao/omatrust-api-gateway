# Trust Anchors — Plan

Status: Implemented

This feature is part of the OMATrust Review Widget system. The full build plan lives in:

→ [omatrust-widgets/docs/features/review-widget/plan.md](https://github.com/oma3dao/omatrust-widgets/blob/main/docs/features/review-widget/plan.md)

## Scope

Serve OMA3 trust anchors at `/v1/trust-anchors`. The SDK fetches this on signing bridge creation to validate contracts, schemas, and origins. `/v1/trust-policy` remains as a compatibility alias.
