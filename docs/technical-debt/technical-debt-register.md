# Technical Debt Register

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Maintainer**: Claude (architecture governor)
- **Source**: the Phase 10 audit reports under [`docs/audits/`](../audits/)

This register is the single tracked list of known architectural debt in NEXT.
Each item carries an owner and a recommended fix. Items are closed only when the
fix lands; severity follows the audit scale (P0 blocker → P3 cleanup).

## Register

| ID    | Area       | Description                                                                                                                 | Severity | Owner             | Recommended fix                                                                              | Status      |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------- | -------------------------------------------------------------------------------------------- | ----------- |
| TD-01 | Events     | Dual topic catalog (`CATEGORY_TOPICS` vs legacy `TOPICS`) with no declared authority                                        | P1       | Claude + Codex    | One event-topology ADR; mark legacy topics deprecated with a migration path                  | Open        |
| TD-02 | Media      | Duplicate transcoding: `media-service/transcoder` (Rust, Kafka contract) overlaps `transcoding-service` (Go, gRPC contract) | P1       | Claude + Codex    | Reconciliation ADR; relocate the Rust worker under `transcoding-service`, unify the contract | Open        |
| TD-03 | Process    | Three agents' work was intermingled uncommitted on one working tree; isolation branches created late                        | P1       | Codex + Composer  | Each agent commits its domain to its `agent/*` branch; integrate via `develop`               | In progress |
| TD-04 | Testing    | Near-zero test coverage — 9 of 39 services have any Go tests; most have one                                                 | P1       | Codex             | Define a test bar (domain unit tests + one store integration test) for prod promotion        | Open        |
| TD-05 | Security   | Auth / JWT / authz code paths ship without regression tests                                                                 | P1       | Codex             | Prioritize tests for auth-service, api-gateway JWT path, access-control-service              | Open        |
| TD-06 | Events     | Two event-definition mechanisms — protobuf schemas vs. Zod contracts                                                        | P2       | Codex             | Declare protobuf the source of truth; Zod validates around proto-derived payloads            | Open        |
| TD-07 | Packages   | `@next/media-events` / `@next/trust-events` hand-mirror schema-owned event types                                            | P2       | Codex             | Reduce mirror packages to re-exports of generated types, or deprecate                        | Open        |
| TD-08 | Events     | Phase 8 `REC_*` topic constants left uncommitted (topics.ts entanglement)                                                   | P2       | Codex             | Absorb into the events-package PR or a `develop` reconciliation pass                         | Open        |
| TD-09 | Services   | Two divergent Go `internal/` layout conventions; neither matches the canonical set                                          | P2       | Claude            | Ratify one canonical service layout by ADR; realign services lazily                          | Open        |
| TD-10 | Discovery  | Cross-encoder ranker home is ambiguous — `recommendation-service/ranker` vs empty `ranking-service`                         | P2       | Claude            | Decide ranker location in the reconciliation ADR (TD-02 sibling)                             | Open        |
| TD-11 | Events     | DLQ defined for only 4 categories; others fall back to the analytics DLQ                                                    | P2       | Codex             | Define a DLQ per event category, or document the shared-DLQ triage flow                      | Open        |
| TD-12 | Events     | Replay topic prefix declared; no replay mechanism implemented                                                               | P2       | Codex             | Implement replay, or explicitly defer with a tracked ticket                                  | Open        |
| TD-13 | Security   | Service-to-service trust boundary (mesh mTLS) is implicit, asserted nowhere                                                 | P2       | Claude + Codex    | Document the mesh as the trust boundary; verify `STRICT` mTLS in non-local envs              | Open        |
| TD-14 | Services   | `live-service` (Rust ingest only, no Go entrypoint) and `community-service` (no proto, no layout) are irregular             | P2       | Codex             | Normalize both to the scaffold standard                                                      | Open        |
| TD-15 | Services   | 20 services are scaffold-only — a large unbuilt surface                                                                     | P2       | Codex             | Sequence implementation in the integration roadmap by dependency order                       | Open        |
| TD-16 | Packages   | UI-layer packages have proliferated to ~12 with convention-only boundaries                                                  | P3       | Claude + Composer | Document a UI-package taxonomy (ADR or `packages/README.md` section)                         | Open        |
| TD-17 | Docs       | `packages/README.md` index lists ~26 of ~39 packages                                                                        | P3       | Claude            | Refresh the package index table                                                              | Open        |
| TD-18 | Governance | `.github/instructions/` is an unindexed set of agent directives                                                             | P3       | Claude            | Add `.github/instructions/README.md` indexing directives + precedence                        | Open        |
| TD-19 | ADR        | ADRs 0001–0032 use the pre-governance template format                                                                       | P3       | Claude            | Lazy upgrade when each ADR is next substantively edited — intentional                        | Accepted    |

## Summary by severity

| Severity | Count | Items                             |
| -------- | ----- | --------------------------------- |
| P1       | 5     | TD-01, TD-02, TD-03, TD-04, TD-05 |
| P2       | 9     | TD-06 … TD-14, TD-15              |
| P3       | 4     | TD-16, TD-17, TD-18               |
| Accepted | 1     | TD-19                             |

There are **no P0 items** — nothing is so broken that all work must halt. The
five P1 items are the gate for the next implementation wave (see the
[integration roadmap](../integration/next-integration-roadmap.md)).

## Maintenance

- A new architectural decision that creates debt adds a row here in the same PR.
- Closing an item requires the fix to have merged to `develop`.
- This register is reviewed at the start of every integration phase.
