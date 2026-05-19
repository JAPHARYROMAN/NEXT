# 0013. Feature flags: OpenFeature SDK + GrowthBook self-hosted

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform
- **Tags**: dx, deployment

## Context

We deploy continuously. Every meaningful new behavior ships behind a flag — for canary, audience targeting, A/B experimentation, and quick kill-switches. We need a vendor-portable SDK, a backend that handles thousands of evaluations per second, and an experimentation surface for product.

## Decision

- **OpenFeature** is the SDK API every service and client uses. Vendor-portable.
- **GrowthBook self-hosted** is the v1 evaluation backend + experimentation surface.
- All flags are declared in a typed registry under [`packages/feature-flags/flags`](../../packages/feature-flags); CI checks that any referenced flag exists there.

## Alternatives considered

- **LaunchDarkly** — best-in-class, expensive at scale. We may swap to it via OpenFeature without service code changes.
- **Flagsmith** — capable; we chose GrowthBook for the better experimentation primitives and stats engine.
- **Home-rolled flag service** — rejected; not our competitive advantage and a real engineering tax.

## Consequences

### Positive
- Service code is vendor-agnostic via OpenFeature; we can swap backends.
- Typed flag registry prevents the "stale flag" zoo from accumulating; CI fails on undeclared flags and reports stale ones older than 90 days.
- Experimentation primitives built-in (Bayesian + frequentist).

### Negative
- Self-hosted GrowthBook = one more service to operate (mitigated: low traffic, simple HA via two replicas + Postgres).
- Cross-service flag consistency requires care; we standardize on `<domain>.<feature>` naming and force-publish via CI.

## Implementation notes

- SDK initialization in every service via `packages/feature-flags`.
- Client-side evaluation uses a manifest snapshot polled every 30s; server-side falls through to the API for low-cardinality flags.
- All flag changes audit-logged.
