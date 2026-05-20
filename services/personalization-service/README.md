# personalization-service

The interest graph + user/session models. Owns who a user is to the
recommendation system — and, just as importantly, keeps that model from
hardening into a cage.

Owner: `@next-ecosystem/discovery`.

## Internal gRPC

- `PersonalizationService.GetProfile(user_id) → InterestProfile` — slow taste vector + top interest-graph nodes.
- `PersonalizationService.UpdateSession(session_id, event)` — folds an event into the fast session vector.
- `PersonalizationService.GetExplorationVector(user_id) → Vector` — the direction _away_ from the centroid, sampled by serendipity.
- `PersonalizationService.InferMode(session_id) → DiscoveryMode` — exploration-appetite inference.

## Events

**Emitted**: `rec.discovery.mode.changed.v1`.
**Consumed**: `playback.*`, `search.query.executed.v1`, `profile.follow.*`, `community.*`.

Partition key: `user_id`.

## Data

- Interest graph in Neo4j (shares the ADR 0023 cluster); affinity edges decay on a 21-day half-life (ADR 0032).
- Slow user vector + fast session vector in the Redis feature store.

## Doctrine

- Interests **decay** — no hard lock-in; a user is never defined permanently by their past (ADR 0032).
- A detected taste shift gets a learning-rate boost so reinvention is not a weeks-long fight against history.

## SLO

- `GetProfile P95 < 40 ms` · `Mode inference P95 < 15 ms`.

[Runbook](../../docs/runbooks/personalization-service.md) · [Fairness systems](../../docs/recommendation/fairness-systems.md).
