# Service Maturity Matrix

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: all 39 directories under `/services` (excludes `_template`)

## Executive summary

NEXT has **39 backend services**. **19 are functional** (deep: gRPC + store +
`cmd/server`, built across Phases 1–8); **20 are scaffold-only** (`go.mod` +
`README` [+ `proto`], no entrypoint). Two services are production-ready
candidates. The dominant risk is **test coverage**: only 9 services have any Go
tests, and most have one. Maturity below is a structural classification (folder
presence + known build history), not a guarantee of production readiness.

**Maturity legend**: `scaffold` (README + go.mod [+ proto], no code) ·
`functional` (deep — runnable gRPC service with store + api + cmd/server) ·
`prod-candidate` (functional + tests + verified boot) · `blocked` (invalid /
conflicting).

## Matrix

| Service                       | Domain    | APIs        | DB / migrations | Events                   | Tests | Observability | Maturity       | Risks                                      | Owner        |
| ----------------------------- | --------- | ----------- | --------------- | ------------------------ | ----- | ------------- | -------------- | ------------------------------------------ | ------------ |
| auth-service                  | Identity  | gRPC + JWKS | Postgres ✓      | emits user.registered    | 1     | OTel ✓        | functional     | thin tests                                 | Codex        |
| profile-service               | Identity  | gRPC        | Postgres ✓      | consumes user.registered | 1     | OTel ✓        | functional     | thin tests                                 | Codex        |
| session-service               | Identity  | gRPC        | Postgres ✓      | consumer                 | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| api-gateway                   | Platform  | GraphQL     | —               | —                        | 0     | OTel ✓        | functional     | no tests; JWT path                         | Codex        |
| access-control-service        | Identity  | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| trust-service                 | Identity  | gRPC        | Postgres ✓      | event-driven             | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| device-graph-service          | Identity  | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| creator-identity-service      | Identity  | gRPC        | Postgres ✓      | —                        | 1     | OTel ✓        | functional     | thin tests                                 | Codex        |
| account-recovery-service      | Identity  | gRPC        | Postgres ✓      | —                        | 1     | OTel ✓        | functional     | thin tests                                 | Codex        |
| notification-auth-service     | Identity  | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| identity-graph-service        | Identity  | gRPC        | Postgres ✓      | —                        | 1     | OTel ✓        | functional     | thin tests                                 | Codex        |
| upload-service                | Media     | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| media-service                 | Media     | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | embeds misplaced Rust transcoder (RB-2)    | Codex        |
| transcoding-service           | Media     | gRPC        | Postgres ✓      | —                        | 0     | OTel ✓        | functional     | contract overlaps media-service/transcoder | Codex        |
| media-processing-orchestrator | Media     | gRPC        | Postgres ✓      | saga consumer            | 0     | OTel ✓        | functional     | no tests                                   | Codex        |
| analytics-service             | Platform  | —           | ClickHouse      | Kafka consumer           | 2     | OTel ✓        | functional     | new (Codex Phase 5)                        | Codex        |
| event-gateway                 | Platform  | HTTP        | —               | Kafka producer           | 3     | OTel ✓        | functional     | new (Codex Phase 5)                        | Codex        |
| recommendation-service        | Discovery | gRPC        | Postgres ✓      | —                        | 3     | OTel ✓        | prod-candidate | Rust ranker location (RB-3)                | Claude→Codex |
| feed-service                  | Discovery | gRPC        | Postgres ✓      | —                        | 3     | OTel ✓        | prod-candidate | —                                          | Claude→Codex |
| community-service             | Social    | —           | —               | —                        | 0     | —             | scaffold       | no proto, no go layout                     | Codex        |
| live-service                  | Media     | —           | —               | —                        | 0     | Rust only     | scaffold       | Rust `ingest/` only; no Go entrypoint      | Codex        |
| moderation-service            | Trust     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| notification-service          | Platform  | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| payment-service               | Economic  | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| search-service                | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| cdn-routing-service           | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| clip-generation-service       | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| media-analytics-service       | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| media-metadata-service        | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| media-search-service          | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| playback-service              | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| subtitle-service              | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| thumbnail-service             | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| video-segmentation-service    | Media     | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| discovery-service             | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| personalization-service       | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| ranking-service               | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | expects Rust ranker (RB-3)                 | Codex        |
| candidate-generation-service  | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |
| semantic-retrieval-service    | Discovery | proto       | —               | —                        | 0     | —             | scaffold       | —                                          | Codex        |

## Findings

### SM-1 — Near-zero test coverage across functional services · Severity: P1

**Evidence**: Of 19 functional services, 10 have **zero** Go tests; the rest have
1–3. recommendation-service and feed-service (3 each) are the only services with
domain-logic unit tests. The 11 identity/media services from Phases 6–7 have at
most one integration test.
**Recommended action**: Mandate a minimum test bar for `functional` →
`prod-candidate` promotion: domain-logic unit tests + one store integration
test. Add it to the PR template's test-evidence gate.
**Owner**: Codex (tests) · **Blocker**: Yes for production promotion · **Next
step**: Roadmap item — backfill tests before any service is declared
production-ready.

### SM-2 — 20 scaffold services are an unbuilt surface · Severity: P2

**Evidence**: 20 services are scaffold-only. They are correctly scaffolded
(README + go.mod + proto) but carry no implementation.
**Recommended action**: Sequence them in the integration roadmap by dependency
order; do not let scaffolds accumulate proto drift while unbuilt.
**Owner**: Codex · **Blocker**: No · **Next step**: See roadmap.

### SM-3 — `live-service` and `community-service` are structurally irregular · Severity: P2

**Evidence**: `live-service` has only a Rust `ingest/` component and no Go
entrypoint or `proto/`. `community-service` has neither `proto/` nor a Go
service layout — it lags every other scaffold.
**Recommended action**: Normalize both to the scaffold standard (Go go.mod +
proto + README); decide whether `live-service` is Go-coordinated with a Rust
ingest worker (parallel to the transcoding question, RB-2).
**Owner**: Codex · **Blocker**: No · **Next step**: Roadmap item.

## Conclusion

The functional core (19 services) is real and runnable. Promotion to production
is gated on **test coverage** (SM-1), the top P1 here. The 20 scaffolds are
healthy but unbuilt — a roadmap-sequencing problem, not a defect.
