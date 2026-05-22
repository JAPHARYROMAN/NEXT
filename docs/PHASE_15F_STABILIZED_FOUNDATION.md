# Phase 15F — Stabilized Foundation Closure

**Status:** Documentation / baseline closure
**Date:** 2026-05-22
**Main SHA at phase start:** `174dca99f13e9c76e24bfbaa03303b0a20eb2f0d`

## Purpose

Phase 15F closes the Phase 15 hardening arc. It does not change application,
frontend, service-runtime, Terraform, or workflow behavior — it records, in one
authoritative place, that `main` has reached a **stabilized foundation**: a
point where CI, Security, Release, and the full container Image build pipeline
are all green, and every service produces a signed, scanned, attested image.

This document is the baseline reference for promoting `main` to a tagged
foundation release and for starting Phase 16.

## Completed hardening arc (Phases 15A–15E)

| Phase   | Scope                                     | Outcome                                                                                                                                                                                                                                                                      |
| ------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **15A** | Infrastructure security                   | CloudFront viewer-TLS floor (`TLSv1.2_2021`) and EKS private-only API endpoint remediated; semgrep Terraform findings cleared. (Landed on `main` via the Phase 15A follow-up restoration after the original PRs were never merged.)                                          |
| **15B** | Build / runtime reproducibility           | Canonical service Dockerfile aligned to the Go workspace — Go `1.25.x`, pinned Alpine/Buf/protoc plugins, in-build `buf generate` with local plugins. Resolved the `go mod download` blocker.                                                                                |
| **15C** | OCI / cosign artifact integrity           | Image references lowercased so `cosign sign` and Trivy image scans target valid OCI references; signing restored for all buildable services.                                                                                                                                 |
| **15D** | Image security & SARIF reporting          | Go toolchain bumped to `1.25.10`, clearing 12 HIGH/CRITICAL Go-stdlib CVEs; `security-events: write` added, per-service SARIF `category`, SARIF upload guarded on file existence.                                                                                            |
| **15E** | Runtime entrypoints & image-build closure | `cmd/server` runtime entrypoints added for the 6 remaining scaffold services — PR #14 (`notification-service`, `search-service`) and PR #16 (`live-service`, `community-service`, `payment-service`, `moderation-service`) — bringing the Image build matrix to **15 / 15**. |

## Final validated workflows on `main`

All four primary workflows are green on `174dca9`:

| Workflow    | Run ID        | Conclusion |
| ----------- | ------------- | ---------- |
| CI          | `26304255006` | ✅ success |
| Security    | `26304255002` | ✅ success |
| Release     | `26304255007` | ✅ success |
| Image build | `26304255008` | ✅ success |

## 15 / 15 services buildable

Every service now produces a runtime image:

`auth` · `profile` · `media` · `upload` · `feed` · `recommendation` ·
`analytics` · `event-gateway` · `api-gateway` · `search` · `notification` ·
`live` · `community` · `payment` · `moderation`

## Full image pipeline validated

For all 15 services, each stage completes successfully:

```
build → push → cosign sign → SBOM / provenance → Trivy → SARIF upload
```

No build-system file, security scanner, or layout validator was weakened to
reach this state — every green is earned by real service code and real fixes.

## Remaining known non-blockers

These are tracked, owned, and explicitly **not** blocking the stabilized
foundation. They do not gate Phase 15F closure and must not be re-flagged as new
regressions.

| Item                                    | Nature                                                                                                                                                                                                                                                                                              | Owner                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **Terraform apply / plan AWS-OIDC gap** | `Terraform plan` / `Terraform apply` fail at `configure-aws-credentials` with `Could not assume role with OIDC: Request ARN is invalid`. Pre-existing infrastructure-CI credentials gap; infra changes cannot be plan-validated against live AWS until the role ARN / GitHub-to-AWS trust is fixed. | repo admin + platform/infra |
| **Dependency Review repo capability**   | `actions/dependency-review-action` reports the feature unsupported; likely requires **GitHub Advanced Security** on this (private) repository. Non-blocking via `continue-on-error`; skipped on push events.                                                                                        | repo admin                  |
| **CloudFront custom ACM certificate**   | `minimum_protocol_version = "TLSv1.2_2021"` is declared, but is runtime-effective only once a custom ACM certificate replaces the default `*.cloudfront.net` certificate. The TLS floor is correct going forward; the certificate migration is the residual follow-up.                              | platform/infra              |

## Exit criteria for Phase 15F

Phase 15F is COMPLETE when:

1. This document is merged to `main`, recording the stabilized-foundation
   baseline and the `174dca9` reference SHA.
2. No application, frontend, service-runtime, Terraform, or workflow behavior
   was changed by this phase (documentation-only).
3. The four primary workflows (CI, Security, Release, Image build) are
   confirmed green on the merge.
4. The remaining non-blockers above are documented, owned, and explicitly
   carried forward — not silently dropped.

## Recommendation — baseline tag after merge

After this PR is reviewed and merged, `main` should be tagged:

```
v0.1.0-stabilized-foundation
```

as an annotated tag on the post-merge `main` commit. The tag marks the first
point at which the full build/security/artifact pipeline is green for all 15
services and serves as a clean rollback and reference baseline.

**The tag is intentionally NOT created in this phase.** Per the Phase 15F
instructions, tag creation is deferred until after PR review and merge, and
requires an explicit instruction.

## Readiness for Phase 16

With the foundation stabilized, Phase 16 can begin: **service wiring and runtime
MVP flows** — connecting the now-buildable services into working end-to-end
paths (API gateway → services → event bus → datastores), implementing real
domain behavior behind the entrypoints, and exercising the first MVP user
flows. Phase 16 builds _on_ this baseline; it does not need to revisit the
build, signing, scanning, or image-pipeline plumbing settled in Phases 15A–15E.

---

_Phase 15F is documentation and baseline closure only — no product, frontend,
service-runtime, Terraform, or workflow behavior was modified._
