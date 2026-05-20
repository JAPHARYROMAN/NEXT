# Runtime Boundary Audit

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Auditor**: Claude (architecture governor)
- **Scope**: `/services/*` runtime conformance to [ADR 0007](../adr/0007-backend-languages.md) and [ADR 0034](../adr/0034-monorepo-boundary-ownership.md)

## Executive summary

The backend runtime boundary is **largely intact**. All 39 service directories
under `/services` are Go modules; no TypeScript or Node backend service exists.
Three services carry isolated Rust perf components, which [ADR 0007](../adr/0007-backend-languages.md)
permits. However, one Rust component (`media-service/transcoder`) is **misplaced
and overlaps a sibling service**, and the deep services have drifted into **two
different `internal/` layout conventions**. No P0 runtime violations; one P1.

## Findings

### RB-1 — No backend runtime violations · Severity: PASS

**Evidence**: All 39 `/services/*` directories contain `go.mod`. Grep for Node
backend markers (Express/Nest/Fastify, `package.json` with a server entry) found
none. Backend runtime is uniformly Go.
**Recommended action**: None. Record as the conformant baseline.
**Owner**: — · **Blocker**: No · **Next step**: Keep `CODEOWNERS` + the Copilot
Go-backend directive enforcing this.

### RB-2 — Misplaced Rust transcoder overlapping `transcoding-service` · Severity: P1

**Evidence**: `services/media-service/transcoder/` is a Rust binary
(`next-media-transcoder`) that "consumes `media.transcode.requested.v1`, runs
ffmpeg, writes renditions to S3, emits `media.video.transcoded.v1`". A separate
deep Go service, `transcoding-service`, already owns transcoding via a gRPC
contract (`SubmitJob` / `ClaimNext` / `CompleteRung`) and a `transcode_jobs`
table. Two implementations of the transcoding capability now exist, with **two
different job contracts** (Kafka `media.transcode.requested.v1` vs. gRPC
`SubmitJob`), and the Rust worker sits inside `media-service/`'s directory —
violating single-service directory ownership.
**Recommended action**: Reconcile via a new ADR. Likely resolution:
`transcoding-service` is the job coordinator; the Rust ffmpeg worker is its
**worker tier** and should move to `transcoding-service/worker/` (or its own
service), consuming the coordinator's contract. Do not leave a transcode worker
nested in `media-service`.
**Owner**: Claude (ADR) → Codex (relocation) · **Blocker**: Yes — blocks further
media-pipeline work · **Next step**: Draft reconciliation ADR; see drift report
finding DR-2.

### RB-3 — Rust ranker location vs. `ranking-service` scaffold · Severity: P2

**Evidence**: `services/recommendation-service/ranker/` is a Rust cross-encoder.
`ranking-service` (scaffold) was created in Phase 8 with a README stating it
hosts "`ranker/` (Rust)". The Rust ranker physically lives in
`recommendation-service`; `ranking-service` is an empty scaffold. The intended
home of the cross-encoder is ambiguous.
**Recommended action**: Decide in the transcoding/ranking reconciliation ADR (or
a sibling): either fold `ranking-service` into `recommendation-service` or move
the ranker into `ranking-service`. Update the Phase 8 docs to match.
**Owner**: Claude (ADR) · **Blocker**: No · **Next step**: Resolve alongside RB-2.

### RB-4 — Two `internal/` layout conventions · Severity: P2

**Evidence**: Phase 6–8 deep services use `cmd/server` + `internal/{api,domain,store}`

- `proto` + `migrations`. Codex's `analytics-service` and `event-gateway` use
  `internal/{api,consumer,kafka,config,events,metrics,…}`. The prompt's canonical
  layout names `internal/{api,domain,store,eventbus,consumer}`. No service matches
  the canonical set exactly; the two families diverge on event-handling packages.
  **Recommended action**: Ratify one canonical Go service layout in an ADR (extend
  [ADR 0007](../adr/0007-backend-languages.md) or a new ADR). New services follow
  it; existing services realign lazily when next touched.
  **Owner**: Claude (ADR) · **Blocker**: No · **Next step**: Add to the
  integration roadmap as a P2 governance item.

### RB-5 — 20 services are scaffold-only · Severity: P2 (informational)

**Evidence**: 20 of 39 services have `go.mod` + `README` (+ often `proto`) but no
`cmd/server/main.go` and no `internal/`. This is the expected scaffold state for
deferred work, not a violation — but it is a large unbuilt surface.
**Recommended action**: Track in the service maturity matrix and roadmap; do not
treat as drift.
**Owner**: Codex (future implementation) · **Blocker**: No · **Next step**: See
[service-maturity-matrix.md](service-maturity-matrix.md).

## Conclusion

Runtime boundary is sound. The one structural P1 — the misplaced, contract-
divergent Rust transcoder — must be reconciled by ADR before more media-pipeline
work proceeds. Layout-convention drift (RB-4) should be settled by ADR but does
not block.
