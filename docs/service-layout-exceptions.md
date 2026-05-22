# Service Layout Exceptions — Phase 14 Debt Classification

Final Phase 14 classification of `scripts/hygiene/validate-service-layout.sh`
output. It combines the **Codex technical classification** (validator output,
scaffold-vs-drift evidence, fix safety) with the **Claude governance
classification** (architectural acceptability, exception policy, enforcement
timing). The validator is **not weakened** and **no violation is hidden** — the
classification only labels and routes existing violations.

Binding doctrine: **ADR 0038 — Canonical Go service layout**. A functional Go
service uses `cmd/server`, `internal/api` (or `internal/handler`),
`internal/domain`, and `internal/store`, with event and migration folders only
when needed. Backend remains Go-only.

`scripts/hygiene/service-exceptions.txt` is the machine-read exception list; it
is explicit and mostly temporary, and defers to this document as the source of
truth.

## Exception policy

Three exception classes — and only three. Real drift is **never** an exception.

| Class                               | Definition                                                                       | Treatment                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Approved exception**              | Service belongs to a recognised non-CRUD family, or is not a service.            | Permanent. Requires architecture (Claude) sign-off; a layout-variant ADR should formalise it. |
| **Scaffold-only**                   | Service exists but its README marks it `scaffolded` — stub code, no real domain. | Temporary. Removal trigger: real `internal/*` domain packages appear.                         |
| **Future implementation**           | README/proto shell only; no Go control plane yet.                                | Temporary. Removal trigger: the service is built.                                             |
| **Real drift** _(not an exception)_ | Functional Go service missing a required dir.                                    | **Never** added to `service-exceptions.txt`. Stays flagged until fixed.                       |

Adding an entry to `service-exceptions.txt` requires an architecture review note
(Claude). Real drift must keep failing the validator until the service is
realigned to ADR 0038. The doctrine itself is never relaxed; non-CRUD families
are handled by adding _variant_ doctrines, not by deleting checks.

## Compliant services (5)

`auth-service`, `feed-service`, `media-service`, `profile-service`, and
`recommendation-service` satisfy ADR 0038 in full. No action.

## Classification table

35 violations across 40 services. Columns: service · violation · classification
· reason · owner · priority.

| Service                         | Violation                         | Classification        | Reason                                                                              | Owner                                                       | Priority |
| ------------------------------- | --------------------------------- | --------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| `_template`                     | All four required dirs            | Approved exception    | Not a deployable service — the service scaffolding template.                        | Architecture + Backend                                      | P3       |
| `api-gateway`                   | `internal/api`, `domain`, `store` | Approved exception    | Edge GraphQL Federation ingress (ADR 0006); `internal/gql` + `authz`, no datastore. | `@next-ecosystem/platform`                                  | P2       |
| `access-control-service`        | `internal/domain`                 | Scaffold-only         | README status: scaffolded — first real Rego bundles in Phase 7.                     | `@next-ecosystem/identity` + `@next-ecosystem/security`     | P2       |
| `account-recovery-service`      | `internal/domain`                 | Scaffold-only         | README status: scaffolded — real recovery flows in Phase 7/8.                       | `@next-ecosystem/identity`                                  | P2       |
| `creator-identity-service`      | `internal/domain`                 | Scaffold-only         | README status: scaffolded.                                                          | `@next-ecosystem/creator`                                   | P2       |
| `device-graph-service`          | `internal/domain`                 | Scaffold-only         | README status: scaffolded.                                                          | `@next-ecosystem/identity`                                  | P2       |
| `identity-graph-service`        | `internal/domain`, `store`        | Scaffold-only         | README status: scaffolded; `internal/graph` to be split into domain/store later.    | `@next-ecosystem/identity`                                  | P2       |
| `notification-auth-service`     | `internal/domain`                 | Scaffold-only         | README status: scaffolded.                                                          | `@next-ecosystem/identity` + `@next-ecosystem/messaging`    | P2       |
| `trust-service`                 | `internal/domain`                 | Scaffold-only         | README status: scaffolded — constant-score impl Phase 6, real model Phase 8.        | `@next-ecosystem/trust-safety` + `@next-ecosystem/identity` | P1       |
| `analytics-service`             | `internal/domain`, `store`        | Real drift            | Functional service; Phase 5 layout predates ADR 0038.                               | `@next-ecosystem/data`                                      | P1       |
| `event-gateway`                 | `internal/api`, `domain`, `store` | Real drift            | Active gateway still on pre-ADR `internal/gateway/events/kafka` layout.             | `@next-ecosystem/platform`                                  | P1       |
| `session-service`               | `internal/domain`                 | Real drift            | Functional identity service has `api`/`store` but no pure domain package.           | `@next-ecosystem/identity`                                  | P1       |
| `upload-service`                | `internal/domain`                 | Real drift            | Functional upload service has `api`/`blob`/`store` but no pure domain package.      | `@next-ecosystem/media`                                     | P1       |
| `media-processing-orchestrator` | `internal/domain`                 | Real drift            | `internal/saga` should be split or promoted into a domain boundary.                 | `@next-ecosystem/media`                                     | P2       |
| `transcoding-service`           | `internal/domain`                 | Real drift            | `internal/ladder` should be split or promoted into a domain boundary.               | `@next-ecosystem/media`                                     | P2       |
| `candidate-generation-service`  | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/discovery`                                 | P2       |
| `cdn-routing-service`           | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/media`                                     | P2       |
| `clip-generation-service`       | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/media`                                     | P2       |
| `community-service`             | All four required dirs            | Future implementation | Social service shell only.                                                          | `@next-ecosystem/social`                                    | P1       |
| `discovery-service`             | All four required dirs            | Future implementation | Discovery surface shell only.                                                       | `@next-ecosystem/discovery`                                 | P1       |
| `live-service`                  | All four required dirs            | Future implementation | Documented Go control plane not present yet.                                        | `@next-ecosystem/streaming`                                 | P1       |
| `media-analytics-service`       | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/media`                                     | P2       |
| `media-metadata-service`        | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/media`                                     | P2       |
| `media-search-service`          | All four required dirs            | Future implementation | README/proto shell only.                                                            | `@next-ecosystem/media`                                     | P2       |
| `moderation-service`            | All four required dirs            | Future implementation | Trust & safety service shell only.                                                  | `@next-ecosystem/trust-safety`                              | P1       |
| `notification-service`          | All four required dirs            | Future implementation | Messaging service shell only.                                                       | `@next-ecosystem/messaging`                                 | P2       |
| `payment-service`               | All four required dirs            | Future implementation | High-reliability payments shell only.                                               | `@next-ecosystem/payments`                                  | P1       |
| `personalization-service`       | All four required dirs            | Future implementation | Discovery model service shell only.                                                 | `@next-ecosystem/discovery`                                 | P2       |
| `playback-service`              | All four required dirs            | Future implementation | Media playback shell only.                                                          | `@next-ecosystem/media`                                     | P1       |
| `ranking-service`               | All four required dirs            | Future implementation | Documented Go coordinator not present yet.                                          | `@next-ecosystem/discovery`                                 | P1       |
| `search-service`                | All four required dirs            | Future implementation | Discovery search shell only.                                                        | `@next-ecosystem/discovery`                                 | P1       |
| `semantic-retrieval-service`    | All four required dirs            | Future implementation | Vector retrieval shell only.                                                        | `@next-ecosystem/discovery`                                 | P2       |
| `subtitle-service`              | All four required dirs            | Future implementation | Media subtitle shell only.                                                          | `@next-ecosystem/media`                                     | P2       |
| `thumbnail-service`             | All four required dirs            | Future implementation | Media thumbnail shell only.                                                         | `@next-ecosystem/media`                                     | P2       |
| `video-segmentation-service`    | All four required dirs            | Future implementation | Media segmentation shell only.                                                      | `@next-ecosystem/media`                                     | P2       |

Totals: **2** approved exceptions · **7** scaffold-only · **6** real drift ·
**20** future implementation.

## Required follow-up

### Real drift (6) — not exempted; stays flagged

These are functional Go services. Fixes are per-service, one at a time — **no
mass refactor**, and **no empty `internal/domain/` folder** created merely to
silence the validator (that hides drift and is forbidden).

| Service                         | Required follow-up                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analytics-service`             | Realign pre-ADR `internal/clickhouse/config/consumer/events/kafka/metrics` into ADR 0038 `domain`, `store`, `eventbus`, `consumer` packages — or adopt the consumer variant once ADR 0043 exists. |
| `event-gateway`                 | Realign `internal/gateway/events/kafka` into ADR 0038 transport/domain/event-adapter boundaries — or adopt the gateway variant once ADR 0043 exists.                                              |
| `session-service`               | Extract session and refresh-token invariants into a real `internal/domain`.                                                                                                                       |
| `upload-service`                | Extract upload-session and asset invariants into `internal/domain` (keep `internal/blob`).                                                                                                        |
| `media-processing-orchestrator` | Promote `internal/saga` orchestration rules into an explicit `internal/domain` — or adopt the orchestrator variant once ADR 0043 exists.                                                          |
| `transcoding-service`           | Extract ladder/rendition decision logic into `internal/domain` (keep `internal/ladder`).                                                                                                          |

### Scaffold-only (7) — temporary exception

Follow-up: implement to full ADR 0038 layout in the README-named phase, then
**remove the service from `service-exceptions.txt`** so the validator enforces
it. Removal trigger: real `internal/*` domain packages appear.

### Future implementation (20) — temporary exception

Follow-up: build with full ADR 0038 layout at the roadmap phase, then **remove
from `service-exceptions.txt`**. Removal trigger: the service is built.

### Approved exceptions (2) — permanent

- `_template` — none; it must remain outside validator scope (it is not a
  service).
- `api-gateway` — none for layout; its shape is correct per ADR 0006. Recommended
  governance follow-up: **ADR 0043** to formalise a "gateway" layout variant so
  it is checked positively rather than skipped.

## Validator status — CI-blocking vs advisory

**Recommendation: advisory now, CI-blocking after the P1 real-fixes land.**

Making the validator hard-blocking today would either block all unrelated CI on
six pre-existing debt items, or pressure contributors to dump those six into the
exception list — which is hiding violations, and forbidden. Two-phase rollout:

1. **Now — advisory.** Run the validator in CI as a **visible, non-blocking**
   job (violations surface as warnings/annotations; the pipeline does not fail).
   It must not be silent. It **should still hard-fail even now** for _new_
   breakage — a newly added service with no layout, or an exempted scaffold that
   gained `.go` files without being de-exempted. The grace covers only the known
   six real-drift services.
2. **Later — blocking.** Flip the job to fully CI-blocking once the P1 real-fixes
   land. Attach a named owner and a deadline to the flip, so "advisory" does not
   become permanent.

## Remaining P0 / P1 concerns

- **P0:** none. No layout violation breaks build or test; Phase 13 CI was fully
  green. The drift is doctrine non-compliance, not a functional defect.
- **P1 (real drift):** `analytics-service`, `event-gateway`, `session-service`,
  `upload-service`.
- **P1 (governance):** **ADR 0043** ("Non-CRUD service layout variants" —
  gateway, orchestrator, graph-backed, warehouse-consumer) is unwritten; until it
  exists, structurally non-CRUD services cannot be classified as anything but
  drift. Owner: Architecture (Claude).
- **P2 (real drift):** `transcoding-service`, `media-processing-orchestrator`.

## When to enforce strict layout compliance

Strict (CI-blocking) enforcement should be turned on when **both** hold:

1. **ADR 0043 is accepted** — so gateway/orchestrator/consumer services have a
   real doctrine to be validated against instead of being exempted by hand.
2. **The four P1 real-drift services are realigned** — recommended gate: the
   blocking flip ships in the same PR that closes the last P1 real-fix.

Until then the validator stays advisory. Scaffold-only and future-implementation
exceptions are re-reviewed at every phase boundary and removed as services are
built, so the exception list shrinks toward zero rather than rotting.

## Verification

`scripts/hygiene/validate-service-layout.sh` was run after this classification:

- **Result:** fails with classified exceptions — `Scanned: 11 services,
violations: 6`, exit code 1.
- 29 services are skipped via `service-exceptions.txt` (2 approved exceptions +
  7 scaffold-only + 20 future implementation); 11 are checked; 5 pass; **6 fail**.
- All 6 failures are the real-drift services above. This is the intended
  outcome: the validator now reports a precise, actionable backlog instead of an
  undifferentiated list of 35. The non-zero exit is correct — real debt remains.
- The validator was not modified and the doctrine was not weakened.
