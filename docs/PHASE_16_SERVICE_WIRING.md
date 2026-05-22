# Phase 16 — Service Wiring & Runtime MVP Flows

**Status:** Planning (documentation only)
**Baseline:** `main` @ `0340a0d089dc73f1ac6f3b5a2b784cb27713a6f2`
(Phase 15F merged; `v0.1.0-stabilized-foundation`).
**Date:** 2026-05-22

## Mission

Phases 15A–15F delivered a _stabilized foundation_: all 15 services build, sign,
scan, and produce attested images, and the four primary workflows are green.
But the services are still **skeletons** — they have `cmd/server` entrypoints
and ADR-0038 layout, not working end-to-end behavior.

Phase 16 wires the foundation into a **runtime MVP**: connect the services into
a small number of real end-to-end paths so a user can register, set up a
profile, upload media, and see a feed — with events flowing and analytics
recording. The goal is a _demonstrable vertical slice_, not feature
completeness.

## MVP runtime flow

The first end-to-end path Phase 16 makes real:

```
auth-service
  → profile-service
    → upload-service / media-service
      → feed-service / recommendation-service
        → analytics-service / event-gateway
          → api-gateway  (single client-facing entrypoint)
```

Read it as: a client calls `api-gateway`; the gateway fans out to the services;
state-changing actions emit events through `event-gateway`; `analytics-service`
consumes those events. The slice is "sign up → profile → upload → feed".

## In-scope services (Phase 16 MVP)

| Service                  | MVP responsibility                                                  |
| ------------------------ | ------------------------------------------------------------------- |
| `auth-service`           | Register / login; issue + verify tokens (OAuth2/OIDC per ADR 0012). |
| `profile-service`        | Create and read a user profile keyed to an auth identity.           |
| `upload-service`         | Accept a media upload, hand off to media-service.                   |
| `media-service`          | Register media metadata; expose playback/reference info.            |
| `feed-service`           | Assemble a basic feed of recent media.                              |
| `recommendation-service` | Provide a minimal ranked ordering for the feed.                     |
| `analytics-service`      | Consume domain events; record basic counters.                       |
| `event-gateway`          | Ingress for emitted domain events onto the bus.                     |
| `api-gateway`            | Single GraphQL/edge entrypoint composing the above.                 |

## Out-of-scope services (Phase 16)

Not wired in this phase — they remain buildable skeletons and are revisited
later: `payment-service`, `community-service`, `moderation-service`,
`live-service`, `search-service`, `notification-service`, plus all identity
sub-services beyond `auth` (`session-service`, `trust-service`,
`access-control-service`, `account-recovery-service`,
`creator-identity-service`, `device-graph-service`, `identity-graph-service`,
`notification-auth-service`), `transcoding-service`,
`media-processing-orchestrator`, and the unbuilt scaffold/future services.

## Service ownership map

| Area                                     | Owning team                 | Implementing agent |
| ---------------------------------------- | --------------------------- | ------------------ |
| `auth-service`                           | `@next-ecosystem/identity`  | Codex              |
| `profile-service`                        | `@next-ecosystem/profile`   | Codex              |
| `upload-service`, `media-service`        | `@next-ecosystem/media`     | Codex              |
| `feed-service`, `recommendation-service` | `@next-ecosystem/discovery` | Codex              |
| `analytics-service`                      | `@next-ecosystem/data`      | Codex              |
| `event-gateway`, `api-gateway`           | `@next-ecosystem/platform`  | Codex              |
| Event/proto contracts, ADRs, review      | Architecture                | Claude             |
| Frontend consumption of the gateway      | `@next-ecosystem/web`       | Composer           |
| Smoke-test / local-runtime tooling       | Platform tooling            | Copilot            |

## Proposed PR sequence

Each PR is a thin, independently reviewable vertical step. Implementation PRs
follow this planning PR.

1. **PR A — Contracts.** Define/confirm the proto + event contracts for the MVP
   flow (auth, profile, media, feed, analytics events). Generated code only;
   no behavior. Owner: Codex, reviewed by Claude.
2. **PR B — auth-service runtime.** Real register/login/token endpoints behind
   `cmd/server`; health + readiness.
3. **PR C — profile-service runtime.** Profile create/read keyed to an auth
   identity; consumes auth tokens.
4. **PR D — upload-service + media-service.** Upload accept → media metadata
   register; emit a `media.uploaded`-class event.
5. **PR E — event-gateway + analytics-service.** Event ingress + a consumer
   that records basic counters.
6. **PR F — feed-service + recommendation-service.** Assemble a feed; minimal
   ranking.
7. **PR G — api-gateway composition.** Wire the gateway to expose the slice as
   one client-facing surface.
8. **PR H — end-to-end smoke test.** A scripted run of the full slice.

PRs B–G each depend on PR A; later PRs depend on earlier ones for the data they
consume. Frontend (Composer) work begins only after PR G stabilizes the gateway
contract.

## Required contracts / events

- **Proto service contracts** (gRPC, per ADR 0006/0019) for auth, profile,
  media, feed, recommendation — schema-first via Buf.
- **Domain events** (Kafka, per ADR 0008/0036/0039) — at minimum:
  `user.registered`, `profile.created`, `media.uploaded`, `feed.viewed` — each
  a versioned protobuf event under `packages/events`.
- **api-gateway schema** — GraphQL surface composing the MVP operations.
- Contracts land first (PR A) and are frozen for the slice before dependent
  services are wired; changes mid-phase require an architecture review note.

## Verification strategy

- **Per service:** unit tests for the new runtime behavior (Codex); the service
  still builds, signs, scans, and SARIF-reports in `Image build` (15/15 stays
  green).
- **Contract checks:** `buf lint` + `buf breaking` stay green; generated code is
  current.
- **Slice integration:** a smoke test (PR H) exercises register → profile →
  upload → feed against locally-run services; events observed on the bus and
  reflected in analytics counters.
- **CI gates:** CI, Security, Release, Image build all remain green on every PR;
  no scanner, validator, or guard is weakened.
- Each PR is reviewed by Claude for architecture/contract conformance before
  merge.

## Local runtime assumptions

- Services run locally via `docker compose` (the repo `docker-compose.yml`) or
  the per-service binaries; backing infra (Kafka, datastores) runs as local
  containers.
- No AWS account, EKS cluster, or live cloud infrastructure is required for
  Phase 16 — the slice is exercised locally. (The Terraform AWS-OIDC gap
  therefore does not block Phase 16.)
- Secrets used locally are development placeholders, never real credentials.
- The Go workspace (`go.work`, Go `1.25.10`) and the Phase 15 build/codegen
  pipeline are reused as-is.

## Exit criteria

Phase 16 is COMPLETE when:

1. The MVP flow runs end to end locally: a user can register, create a profile,
   upload media, and retrieve a feed through `api-gateway`.
2. Domain events flow through `event-gateway` and are recorded by
   `analytics-service`.
3. The 9 in-scope services have real runtime behavior (not stubs) behind their
   entrypoints, with unit tests.
4. A repeatable smoke test demonstrates the slice and runs in CI or as a
   documented local procedure.
5. CI, Security, Release, and Image build remain green; `Image build` stays
   15/15.
6. No frontend, Terraform, or workflow behavior was changed except as the
   gateway contract legitimately requires.

## Non-goals

Explicitly **not** in Phase 16:

- No full production deployment (no EKS rollout, no live cloud environment).
- No real monetization / payment integration — `payment-service` stays a
  skeleton.
- No AI media generation or ML inference paths.
- No large frontend rewrite — frontend consumption is thin and follows the
  stabilized gateway contract.
- No broad service-mesh / Kubernetes expansion — local runtime only.
- No wiring of the out-of-scope services listed above.

## Known non-blockers

Carried from prior phases; tracked, owned, and **not** blocking Phase 16
(which runs locally):

| Item                                                               | Owner                       |
| ------------------------------------------------------------------ | --------------------------- |
| Terraform apply/plan AWS-OIDC role-ARN gap                         | repo admin + platform/infra |
| Dependency Review repository capability / GitHub Advanced Security | repo admin                  |
| CloudFront custom ACM certificate (runtime-effective TLS)          | platform/infra              |

## Agent responsibilities

- **Claude** — architecture, governance, contract/ADR review, PR review.
- **Codex** — Go service wiring, protobuf/event contracts, unit and integration
  tests.
- **Composer** — frontend consumption of the gateway, only after backend
  contracts stabilize (post PR G).
- **Copilot** — tooling and smoke-test helpers, local-runtime scripts.
- **Repo admin** — AWS OIDC, GitHub Advanced Security, and secrets configuration
  (needed later for deployment, not for Phase 16's local slice).

---

_Phase 16 planning document only — no service, frontend, Terraform, or workflow
code was modified. Implementation begins in the PR sequence above after this
plan is reviewed and merged._
