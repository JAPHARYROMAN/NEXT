# NEXT — Phase 12 Integration Plan

**Phase:** 12 — Branch Integration to `develop`
**Author:** Claude (architecture / integration reviewer)
**Date:** 2026-05-20
**Status:** Plan only — **no merge has been performed.** Execution awaits explicit approval.

---

## 1. Purpose

Phase 11.5 closed with verdict **COMPLETE WITH KNOWN NON-BLOCKERS**
([`PHASE_11_FINAL_VERDICT.md`](PHASE_11_FINAL_VERDICT.md)). Four agent branches are each verified
green **in isolation** but have **not** been integrated. This plan defines the order, conflict
expectations, per-merge verification, and rollback procedure for merging them into `develop`.

Branches to integrate (origin tips):

| Branch | Tip | Domain |
|---|---|---|
| `agent/codex-stabilization` | `8da6780` | backend / infra / proto / rust / `gen/go` / CI |
| `agent/claude-architecture` | `c03640a` | docs / ADRs / audits |
| `agent/copilot-utilities` | `39a9389` | hygiene: `.gitignore`, `.husky`, `scripts/hygiene`, `docs/git` |
| `agent/composer-frontend` | `b0b469d` | `apps/*`, frontend `packages/*`, lockfile |

**Lineage:** all four descend from `d97d8b1`. `agent/codex-stabilization` branched directly off
`d97d8b1`; the other three branched off the later `0f84ea2` (which itself descends from `d97d8b1`).
`d97d8b1` is `develop`'s base, so there is a single shared root.

---

## 2. Golden rule

**All merges land on a throwaway integration branch — never on `develop` directly.**
`develop` is fast-forwarded to the integration branch only after *every* post-merge verification is
green. This makes `develop` un-dirtyable and rollback trivial.

Never force-push `develop` or `main`. Never `git add .`.

---

## 3. Preflight

```sh
git fetch origin --prune
git tag pre-phase-11.5-integration origin/develop          # named recovery point
git log --oneline origin/develop                            # CONFIRM develop's true state
git checkout -b integration/phase-11.5 origin/develop       # the throwaway integration branch
```

Before merging, confirm what `origin/develop` actually contains — local `develop` was last seen
`behind origin/develop` by 3 commits. If `origin/develop` has advanced beyond `d97d8b1`, inspect
those 3 commits and account for them in the conflict assessment below.

---

## 4. Merge order

Foundation → governance → hygiene → application. Each later branch's verification depends on
earlier ones being in place.

| Step | Branch | Tip | Rationale |
|---|---|---|---|
| 1 | `agent/codex-stabilization` | `8da6780` | Build / CI / toolchain / `gen/go` / proto foundation. Base `d97d8b1` = `develop`'s base → cleanest merge. All later verification runs against fixed infra. |
| 2 | `agent/claude-architecture` | `c03640a` | Docs / ADRs only — near-zero conflict surface; establishes the governance baseline (ADR 0040 gen/go, ADR 0041 branch ownership). |
| 3 | `agent/copilot-utilities` | `39a9389` | Hygiene. Must land **after** codex so the `.gitignore` `gen/` exception and codex's now-tracked `gen/go/go.mod` are coherent. |
| 4 | `agent/composer-frontend` | `b0b469d` | Largest surface (apps/packages/lockfile). Last, so the frontend builds against an integrated backend — `@next/events#codegen` requires codex's events-proto fix from step 1. |

Each step is a real merge commit:

```sh
git merge --no-ff agent/<branch> -m "merge(phase-12): integrate agent/<branch>"
```

Record the pre-merge SHA before each step.

---

## 5. Expected conflicts

| Merge | Risk | Hotspots / notes |
|---|---|---|
| codex → integration | **Low** | Same base as `develop`; near-clean 3-way merge. Reconcile against the 3 unknown `origin/develop` commits if present. |
| claude → integration | **Low** | Pulls in `bdc859d` / `53a8136` (Phase 6 feat commits) along its lineage — expected history, not a conflict. Docs paths do not overlap codex. |
| copilot → integration | **Low–Medium** | `.gitignore` — only copilot edits it (conflict only vs `develop`'s base). `.husky/pre-commit` — codex did not touch it. |
| composer → integration | **Medium** | Same-package / different-file overlaps: `packages/api-client/` (codex `codegen.ts` vs composer `package.json` + `src/graphql.ts`), `packages/events/` (codex `schemas/*.proto` vs composer `package.json`), `packages/telemetry/`. Git auto-merges file-disjoint changes, but **semantic coordination is required** — verify the package still builds. `pnpm-lock.yaml` is composer-only (low risk). |

If any merge produces a conflict that is not a clean semantic resolution, **stop** and coordinate
with the owning agent rather than guessing.

---

## 6. Verification after each merge

Run the matching block immediately after each merge; do not proceed to the next merge until green.

**After step 1 (codex):**
```sh
buf lint
buf generate                       # codegen must succeed
node scripts/go-work-run.mjs test  # or: task go:test  (per-module Go build + test)
node scripts/go-work-run.mjs lint  # or: task go:lint
terraform fmt -check -recursive infrastructure/terraform
# terraform validate per module
```

**After step 2 (claude):** docs-only.
```sh
git log --graph --oneline -15      # history sanity
buf lint                           # confirm still exit 0
```

**After step 3 (copilot):**
```sh
sh scripts/hygiene/check-no-binaries.sh
sh scripts/hygiene/validate-service-layout.sh
git status --short                 # confirm clean
# confirm the husky pre-commit hook executes
```

**After step 4 (composer) — the true integration gate:**
```sh
pnpm install --frozen-lockfile
pnpm turbo run typecheck lint test build   # first real cross-branch build;
                                            # exercises @next/events#codegen vs codex's proto fix
```

**Final, before fast-forwarding `develop`:**
```sh
task build      # all languages
task test       # all languages
buf lint
buf breaking --against 'https://github.com/JAPHARYROMAN/NEXT.git#branch=main'
```

Only when all of the above pass:
```sh
git checkout develop
git merge --ff-only integration/phase-11.5
git push origin develop
```

---

## 7. Rollback plan

| Situation | Action |
|---|---|
| Unresolved conflict mid-merge | `git merge --abort` |
| Bad merge already committed on the integration branch | `git reset --hard <pre-merge-SHA>` (recorded in §4) |
| Regression found after a later merge | `git revert -m 1 <merge-commit>` — reverts one branch's merge without losing the others |
| Integration branch unrecoverable | delete it; restart from `pre-phase-11.5-integration` tag |
| `develop` itself needs restoring | `git reset --hard pre-phase-11.5-integration` (the tag set in preflight) |

`develop` is never touched until the final fast-forward, so the primary rollback is simply
**discard the integration branch**. Hard rules: no force-push to `develop`/`main`; no `git add .`;
no skipping hooks.

---

## 8. Known non-blockers to address during Phase 12

Carried from `PHASE_11_FINAL_VERDICT.md`:

- **N1** — `.gitignore` does not yet cover `v3/` (buf module cache), `.task/`, `uv.lock`,
  `.terraform.lock.hcl`. Consolidate after step 3.
- **N3** — CI lacks an explicit `buf generate` codegen-drift step and does not invoke the hygiene
  scripts.
- **N4** — `docs/adr/README.md` not updated to index ADRs 0040 / 0041.
- **N5** — `validate-service-layout.sh` reports 35/40 violations with an empty
  `service-exceptions.txt`; resolve or formally except.
- **N6** — stabilization landed on `agent/codex-stabilization`, not `agent/codex-backend`
  (still `d97d8b1`). This plan integrates `agent/codex-stabilization`; confirm before merge.

---

## 9. Execution status

**Not started.** This document is the plan. Merge step 1 begins only on explicit approval.

*Inspection/planning only — no branches merged, no `develop` modified.*
