# NEXT Integration Roadmap

- **Phase**: 10 — System Integration Review
- **Date**: 2026-05-20
- **Author**: Claude (architecture governor)
- **Source**: the Phase 10 audit reports and the [technical-debt register](../technical-debt/technical-debt-register.md)

This roadmap sequences the work that makes NEXT coherent before the next wave of
feature implementation. It is the **integration gate**: items in §1 must clear
before broad feature work resumes.

## 1. Must fix before more features (the integration gate)

These five P1 items are blocking. Feature work that touches events, the media
pipeline, or any identity/auth surface should wait behind the relevant item.

| #   | Item                                                                                                                      | Debt  | Why blocking                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------- |
| 1   | Complete the branch integration — Codex and Composer commit their domains to their `agent/*` branches; merge to `develop` | TD-03 | Until done, `main` does not reflect the real system; no audit can be re-verified |
| 2   | Event-topology ADR — declare the canonical topic catalog + legacy migration path                                          | TD-01 | Every new producer/consumer otherwise picks a catalog by guess                   |
| 3   | Transcoding reconciliation ADR — coordinator vs. worker; relocate the Rust worker                                         | TD-02 | Blocks all media-pipeline work; two contracts cannot both stand                  |
| 4   | Test bar — define and enforce minimum coverage for `functional` → production promotion                                    | TD-04 | No service can be called production-ready without it                             |
| 5   | Auth/JWT test backfill                                                                                                    | TD-05 | Security-critical code is shipping untested                                      |

**Gate rule**: no service is promoted past `functional` maturity, and no new
event contract is added, until items 2–5 are resolved. Item 1 precedes
everything — the audit must be re-runnable against an integrated tree.

## 2. Can proceed in parallel (not blocked)

- Continued **scaffold→functional** implementation of services whose domain is
  unaffected by the event/transcoding ADRs — e.g. `playback-service`,
  `media-metadata-service`, `subtitle-service`, `thumbnail-service` may proceed
  once they adopt the canonical layout.
- **Frontend** work in `/apps` and UI packages — Composer's domain is not gated
  by the backend P1s, provided it consumes existing SDK contracts.
- **AI subsystem** implementation in `/ai` — Python pipelines can be built
  against the existing event/embedding contracts.
- **Documentation** and ADR work — Claude's domain, always parallel-safe.

## 3. Work that requires an ADR first

| Decision                                                | New ADR                                                                     | Owner  |
| ------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| Canonical event topic model + legacy migration          | event-topology ADR                                                          | Claude |
| Transcoding coordinator/worker split + ranker home      | transcoding-and-ranking reconciliation ADR                                  | Claude |
| Canonical Go service `internal/` layout                 | service-layout ADR (or extend [ADR 0007](../adr/0007-backend-languages.md)) | Claude |
| Protobuf as the single event-definition source of truth | may extend [ADR 0019](../adr/0019-schema-first.md)                          | Claude |

## 4. Assigned to Codex (backend / infrastructure)

- Commit `agent/codex-backend`; integrate to `develop` (TD-03).
- Implement the canonical event catalog once the ADR lands; collapse the Zod/
  proto duplication (TD-06); absorb the orphaned `REC_*` topics (TD-08).
- Relocate the Rust transcode worker per the reconciliation ADR (TD-02).
- Test backfill — auth/JWT first (TD-05), then the test bar repo-wide (TD-04).
- DLQ-per-category and replay implementation (TD-11, TD-12).
- Normalize `live-service` and `community-service` (TD-14).
- Sequence scaffold→functional builds for the 20 scaffolds (TD-15).

## 5. Assigned to Composer (frontend / experience)

- Commit `agent/composer-frontend`; integrate to `develop` (TD-03).
- Review the UI-package taxonomy Claude drafts; confirm boundaries (TD-16).
- No backend-blocked work — frontend may proceed against existing SDKs.

## 6. Assigned to Copilot (local acceleration)

- File-level assistance only, inside whatever an owning agent is editing.
- May assist with the mechanical test backfill (TD-04/TD-05) under Codex's
  direction — writing test cases for already-specified behavior.
- No service scaffolding, no architectural decisions.

## 7. Under Claude governance (architecture)

- Author the four ADRs in §3.
- Maintain the [technical-debt register](../technical-debt/technical-debt-register.md)
  and re-run this audit after the §1 gate clears.
- Document the mesh trust boundary (TD-13), the UI taxonomy (TD-16), refresh the
  package index (TD-17), index `.github/instructions` (TD-18).
- Review every cross-domain PR for ADR compliance and boundary violations.

## Sequencing summary

```
Step 0  ── integrate branches to develop ............... TD-03   [BLOCKING]
Step 1  ── event-topology ADR + transcoding ADR ........ TD-01, TD-02
Step 2  ── implement ADR outcomes (Codex) .............. TD-02, TD-06, TD-08
Step 3  ── test bar + auth tests ....................... TD-04, TD-05
            ── parallel: frontend, AI, docs, scaffolds that adopt the canon
Step 4  ── re-run the Phase 10 audit against develop
Step 5  ── resume broad feature implementation
```

Feature velocity resumes at Step 5. Steps 0–3 are the price of having built fast
with four agents — and are far cheaper paid now than after another phase.
