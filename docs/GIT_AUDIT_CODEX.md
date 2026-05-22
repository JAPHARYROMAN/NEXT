# NEXT Git State Audit - Codex

- Agent: Codex GPT-5.5
- Date: 2026-05-20
- Repository: `C:\projects\Actual Projects\next`
- Mode: Git-state audit only.
- Write action taken: created this report file only. No files were staged, committed, pushed, reverted, or deleted.
- Governing repo rule: NEXT Constitution Section 6 requires directory structure, service boundaries, deployment configs, security, testing, and observability to be explicit and reviewable before integration.

## 1. Executive Summary

The repository is **dirty and not push-ready**.

Current branch is `agent/claude-architecture`, tracking `origin/agent/claude-architecture`, and is **ahead by 10 commits**. The working tree has **0 staged files**, **47 modified tracked files**, **0 deleted files**, **0 renamed files**, and **217 untracked status entries**. Expanding untracked directories yields approximately **785 untracked files** grouped mostly under `packages/`, `apps/`, and `docs/`.

The uncommitted work appears to be a large frontend/product-experience expansion: web/studio/mobile/tv/immersive routes, UI packages, design-system extensions, documentation, and package manager changes. There are no current Git changes under `services/`, `.github/workflows/`, `infrastructure/`, protobuf files, migrations, `go.work`, `go.work.sum`, `Cargo.toml`, or `pyproject.toml`.

Push readiness is **FAIL** because:

- The branch is already ahead by 10 commits.
- The working tree is dirty.
- `pnpm-lock.yaml` is modified.
- Many package manifests changed or are newly untracked.
- Hundreds of new files are untracked and need ownership/scope review.
- `gen/go` exists locally and is ignored, while `go.work` tracks only `go.work`/`go.work.sum` and references `./gen/go`; this can break fresh clones unless generated module boundary files are tracked or generation is mandatory before Go commands.
- Audit files from multiple agents are untracked and should be committed separately or excluded intentionally.

## 2. Current Branch and Upstream

- Current branch: `agent/claude-architecture`
- Upstream: `origin/agent/claude-architecture`
- Ahead/behind: ahead 10, behind 0
- Remote:
  - `origin https://github.com/JAPHARYROMAN/NEXT.git (fetch)`
  - `origin https://github.com/JAPHARYROMAN/NEXT.git (push)`
- Recent local HEAD: `0f84ea2 docs: platform security + zero-trust architecture doctrine`
- Remote tracking base: `53a8136 feat(design): phase 6 cinematic experience layer`

## 3. Clean/Dirty Verdict

Verdict: **DIRTY**

- Staged files: 0
- Modified tracked files: 47
- Deleted files: 0
- Renamed files: 0
- Untracked status entries: 217
- Expanded untracked file count by top-level folder:
  - `packages`: 538
  - `apps`: 167
  - `docs`: 79
  - `IMPLEMENTATION_STATUS.md`: 1

## 4. Commit Readiness Verdict

Verdict: **NOT READY AS ONE COMMIT**

Reason: this is multiple logical changes mixed together:

- frontend app route expansion
- TV/immersive app conversion/additions
- studio app expansion
- shared UI package additions
- design/theme/layout package changes
- documentation packs
- audit files
- lockfile/package manager updates

These should be reviewed and committed as split, focused commits after verification.

## 5. Push Readiness Verdict

Verdict: **DO NOT PUSH NOW**

Reasons:

- branch already has 10 unpushed commits
- dirty working tree
- no files staged, so current state is not represented in commits
- generated/ignored `gen/go` local state may hide a fresh-clone problem
- package lock and package manifest changes require install/build/test verification
- previous repo audit found root verification failures; do not push until those are resolved or explicitly accepted

## 6. Full Checklist

| # | Area | Status | Risk | Summary |
|---:|---|---|---|---|
| 1 | Current branch | PASS | P2 | `agent/claude-architecture`. |
| 2 | Remote configuration | PASS | P2 | `origin` points to `JAPHARYROMAN/NEXT`. |
| 3 | Upstream tracking branch | PASS | P2 | Tracks `origin/agent/claude-architecture`, ahead 10. |
| 4 | Git status summary | FAIL | P1 | Dirty tree with 47 modified and many untracked files. |
| 5 | Modified files | REVIEW | P1 | 47 tracked files modified, mostly apps/packages plus lockfile. |
| 6 | Added/untracked files | REVIEW | P1 | 217 untracked entries, about 785 expanded files. |
| 7 | Deleted files | PASS | P3 | No deleted files reported. |
| 8 | Renamed files | PASS | P3 | No renamed files reported. |
| 9 | Ignored files maybe tracked | REVIEW | P1 | `gen/go` is ignored but `go.work` depends on `./gen/go`. |
| 10 | Tracked files maybe ignored | PASS | P3 | No tracked binaries/build artifacts found by inspected patterns. |
| 11 | Generated files | REVIEW | P1 | `gen/go` is local ignored generated content; no generated changes shown in Git. |
| 12 | Build artifacts tracked | PASS | P3 | No tracked binary/build artifact found by binary-extension scan. |
| 13 | Large/binary files | PASS | P3 | No tracked or untracked files over 1 MiB found in inspected sets. |
| 14 | Secrets/sensitive files | REVIEW | P1 | No obvious live secret found; prod-like URLs and secret refs require review. |
| 15 | Lockfiles changed | REVIEW | P1 | `pnpm-lock.yaml` modified. |
| 16 | Package manager changes | REVIEW | P1 | 7 tracked package manifests modified; 42 new package manifests untracked. |
| 17 | Go module/workspace changes | REVIEW | P1 | No tracked Go changes, but ignored `gen/go` may hide required module files. |
| 18 | Proto/generated-code changes | REVIEW | P1 | No Git changes, but ignored generated code affects Go workspace. |
| 19 | Migration changes | PASS | P3 | No migration changes reported. |
| 20 | Infra/Terraform/Kubernetes changes | PASS | P3 | No Git changes reported. |
| 21 | CI/CD workflow changes | PASS | P3 | No workflow changes reported. |
| 22 | Documentation-only changes | REVIEW | P2 | 79 untracked docs files plus audit docs. |
| 23 | Agent-created files | REVIEW | P2 | `docs/AUDIT_*`, `docs/GIT_AUDIT_Composer.md`, this file. |
| 24 | Conflicting/duplicated files | REVIEW | P2 | Multiple audit reports and demo packages need ownership grouping. |
| 25 | Files from local tool execution | REVIEW | P2 | `node_modules`, `.turbo`, `.worktrees`, `.claude`, ignored `gen/go` present. |
| 26 | Files safe to commit | PARTIAL | P2 | Docs/audits may be safe only as separate commits. |
| 27 | Files unsafe to commit | FAIL | P1 | Do not commit ignored generated/build/tool state or unreviewed lockfile. |
| 28 | Files needing review | FAIL | P1 | Most app/package additions need review and verification. |
| 29 | Files to revert/delete | UNKNOWN | P2 | Do not delete automatically; review generated/local artifacts and duplicate audits. |
| 30 | Push readiness | FAIL | P0 | Not push-ready. |

## 7. Modified Files

Git state: **modified, unstaged**. Recommendation: **review and split commit**.

### App Package and Config Changes

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `apps/immersive/package.json` | P1 | review / split commit | Converts package identity and scripts from Next app shape to Vite app shape; affects workspace package graph. |
| `apps/studio/package.json` | P1 | review / split commit | Adds many workspace UI dependencies and testing dependency. |
| `apps/tv/package.json` | P1 | review / split commit | Reworks TV dependencies toward motion/layout/navigation packages. |
| `apps/web/package.json` | P1 | review / split commit | Adds many new workspace dependencies; must align with untracked package additions and lockfile. |
| `apps/studio/next.config.ts` | P2 | review | App config change; verify build impact. |
| `apps/studio/tailwind.config.cjs` | P2 | review | Styling/build config change. |
| `apps/web/next.config.ts` | P2 | review | App config change; verify build impact. |
| `apps/web/tailwind.config.cjs` | P2 | review | Styling/build config change. |
| `apps/web/vitest.config.ts` | P2 | review | Test config change; Git warns CRLF will become LF. |

### App Source Changes

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `apps/mobile/README.md` | P3 | commit with mobile docs | Documentation-only update. |
| `apps/studio/src/app/analytics/page.tsx` | P2 | review / split commit | Studio route behavior changed. |
| `apps/studio/src/app/content/page.tsx` | P2 | review / split commit | Studio route behavior changed. |
| `apps/studio/src/app/layout.tsx` | P2 | review / split commit | Shared Studio layout changed. |
| `apps/studio/src/app/live/page.tsx` | P2 | review / split commit | Studio live route changed. |
| `apps/studio/src/app/monetization/page.tsx` | P2 | review / split commit | Studio monetization route changed. |
| `apps/studio/src/app/page.tsx` | P2 | review / split commit | Studio home route changed. |
| `apps/studio/src/app/upload/page.tsx` | P2 | review / split commit | Studio upload route changed. |
| `apps/studio/src/layouts/studio-shell.tsx` | P2 | review / split commit | Shared Studio shell changed. |
| `apps/web/src/app/(app)/explore/page.tsx` | P2 | review / split commit | Web app route changed. |
| `apps/web/src/app/(app)/home/page.tsx` | P2 | review / split commit | Web home route changed. |
| `apps/web/src/app/(app)/library/page.tsx` | P2 | review / split commit | Web library route changed. |
| `apps/web/src/app/(app)/watch/[id]/page.tsx` | P2 | review / split commit | Watch route changed; higher product risk. |
| `apps/web/src/app/(public)/onboarding/page.tsx` | P2 | review / split commit | Public onboarding route changed. |
| `apps/web/src/app/(public)/page.tsx` | P2 | review / split commit | Public landing/root route changed. |
| `apps/web/src/features/explore/community-rail.tsx` | P2 | review / split commit | Shared feature component changed. |
| `apps/web/src/lib/nav-items.ts` | P2 | review / split commit | Navigation behavior changed. |

### Package Source Changes

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `packages/animation-system/src/index.ts` | P2 | review / split commit | Public exports changed. |
| `packages/animation-system/src/variants.ts` | P2 | review / split commit | Motion behavior changed; broad UI impact. |
| `packages/design-system/package.json` | P2 | review | Adds `spatial-tokens` export. |
| `packages/design-system/src/breakpoints.ts` | P2 | review | Design-system primitive changed. |
| `packages/design-system/src/index.ts` | P2 | review | Public exports changed. |
| `packages/design-system/src/themes.ts` | P2 | review | Theme behavior changed. |
| `packages/design-system/src/tokens.css` | P2 | review | Global design tokens changed. |
| `packages/frontend-utils/src/index.ts` | P2 | review | Public exports changed. |
| `packages/frontend-utils/src/stores/feed-store.ts` | P2 | review | Shared frontend state changed. |
| `packages/frontend-utils/src/stores/index.ts` | P2 | review | Store exports changed broadly. |
| `packages/frontend-utils/src/stores/player-store.ts` | P2 | review | Shared player state changed. |
| `packages/frontend-utils/src/telemetry/index.ts` | P1 | review | Large telemetry addition; privacy and event taxonomy need review. |
| `packages/icons/src/icons.tsx` | P2 | review | Icon set changed. |
| `packages/icons/src/index.ts` | P2 | review | Icon exports changed. |
| `packages/layout-engine/package.json` | P2 | review | Adds frontend-utils dependency. |
| `packages/layout-engine/src/index.ts` | P2 | review | Public exports changed. |
| `packages/theme-system/src/index.ts` | P2 | review | Theme-system exports changed. |
| `packages/ui/package.json` | P2 | review | Adds frontend-utils and navigation-ui dependencies. |
| `packages/ui/src/web/feed-container.tsx` | P2 | review | UI primitive changed. |
| `packages/ui/src/web/mobile-nav.tsx` | P2 | review | Navigation component changed. |

### Lockfile

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `pnpm-lock.yaml` | P1 | review / regenerate / split commit | Modified lockfile increased from 713,277 to 761,758 bytes; must match package manifest changes. |

## 8. Added/Untracked Files

Git state: **untracked**. Recommendation: **review before add**.

### High-Level Groups

| Path group | Expanded file count | Risk | Recommendation | Reason |
|---|---:|---|---|---|
| `packages/**` | 538 | P1 | review / split commit | Many new UI packages, tests, configs, and store modules. |
| `apps/**` | 167 | P1 | review / split commit | New app routes, Vite app files, demo data, tests, and providers. |
| `docs/**` | 79 | P2 | split commit | New documentation packs and agent audits. |
| `IMPLEMENTATION_STATUS.md` | 1 | P2 | review | Status document likely useful, but should be committed separately from product code. |
| `GIT_AUDIT_CODEX.md` | 1 | P2 | commit separately or leave untracked | This report file was intentionally created by Codex. |

### Notable Untracked App Files

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `apps/immersive/index.html` | P1 | review with immersive app commit | New Vite app shell. |
| `apps/immersive/src/**` | P1 | review with immersive app commit | New immersive app source and demo data. |
| `apps/immersive/vite.config.ts` | P1 | review | Build system addition. |
| `apps/tv/index.html` | P1 | review with TV app commit | New Vite app shell. |
| `apps/tv/src/**` | P1 | review with TV app commit | New TV app source and demo data. |
| `apps/tv/vite.config.ts` | P1 | review | Build system addition. |
| `apps/mobile/app/(tabs)/**` | P2 | review with mobile commit | New Expo route files. |
| `apps/studio/src/app/**` new routes | P1 | review with studio commit | New studio experience routes. |
| `apps/studio/src/features/**` | P1 | review with studio commit | New feature code and tests. |
| `apps/studio/src/lib/demo-*.ts` | P2 | review | Demo data must not be mistaken for live backend integration. |
| `apps/web/src/app/**` new routes | P1 | review with web commit | Large product-surface expansion. |
| `apps/web/src/features/**` | P1 | review with web commit | New feature code and tests. |
| `apps/web/src/lib/demo-*.ts` | P2 | review / maybe feature-flag | Demo data should stay clearly non-production. |

### Notable Untracked Package Families

| File/path | Risk | Recommendation | Reason |
|---|---|---|---|
| `packages/adaptive-layouts/**` | P2 | review / split commit | New frontend layout package. |
| `packages/ambient-motion/**` | P2 | review / split commit | New motion package. |
| `packages/broadcast-ui/**` | P2 | review / split commit | New live/broadcast UI package. |
| `packages/charts/**` | P2 | review / split commit | New chart UI package. |
| `packages/chat-ui/**` | P2 | review / split commit | New chat UI package. |
| `packages/commerce-ui/**` | P2 | review / split commit | Contains checkout placeholder; do not present as production commerce. |
| `packages/community-ui/**` | P2 | review / split commit | New community UI package. |
| `packages/creator-ui/**` | P2 | review / split commit | New creator UI package. |
| `packages/discovery-ui/**` | P2 | review / split commit | New discovery UI package. |
| `packages/feed-ui/**` | P2 | review / split commit | New feed UI package. |
| `packages/frontend-utils/src/stores/**` new files | P1 | review | Many global state stores; high coupling risk. |
| `packages/layout-engine/src/**` new files | P2 | review | New shared layout components. |
| `packages/navigation-ui/**` | P2 | review | New navigation package. |
| `packages/player-ui/**` | P2 | review | New player UI package. |
| `packages/privacy-ui/**` | P2 | review | User privacy/account UI; must align with backend contracts. |
| `packages/search-ui/**` | P2 | review | Search UI without root search backend implementation. |
| `packages/social-ui/**` | P2 | review | Social UI without root community backend implementation. |
| `packages/tv-ui/**` | P2 | review | TV UI package. |

## 9. Deleted Files

- Status: PASS
- Git state: none found
- Recommendation: no action
- Reason: `git diff --name-status` reports no `D` entries.

## 10. Renamed Files

- Status: PASS
- Git state: none found
- Recommendation: no action
- Reason: `git diff --name-status` reports no `R` entries.

## 11. Ignored Files That Should Maybe Be Tracked

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `gen/go/**` | ignored | P1 | review / fix ignore or generation workflow | `go.work` references `./gen/go`, but `gen/go/go.mod` and `gen/go/go.sum` are ignored by `**/gen/`; `.gitignore` negation does not currently expose them. Fresh clones may lack required Go workspace module files. |
| `gen/go/go.mod` | ignored | P1 | track or generate before Go commands | Local file exists but `git ls-files` does not track it. |
| `gen/go/go.sum` | ignored | P1 | track or generate before Go commands | Local file exists but `git ls-files` does not track it. |

Ignored local state confirmed:

- `.worktrees/` ignored via `.git/info/exclude`
- `.claude/` ignored via `.gitignore`
- `node_modules/` ignored via `.gitignore`
- `.turbo/` ignored via `.gitignore`

## 12. Tracked Files That Should Maybe Be Ignored

- Status: PASS with one review note
- Evidence:
  - `git ls-files` binary extension scan found no tracked `.exe`, `.dll`, `.so`, `.zip`, `.mp4`, `.png`, `.jpg`, `.pdf`, etc.
  - No tracked files over 1 MiB found in inspected set.
- Review note:
  - `pnpm-lock.yaml` is tracked intentionally, but `.gitattributes` marks it generated and no-diff. It should remain tracked if package manager changes are valid.

## 13. Generated Files

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `gen/go/**` | ignored local generated files | P1 | review / regenerate / track module boundary files | Go generated outputs exist locally but are ignored. |
| `pnpm-lock.yaml` | modified tracked lockfile | P1 | regenerate after package review | Lockfile is generated by package manager and changed. |
| `.turbo/` | ignored local tool cache | P3 | ignore | Build cache, should not be committed. |

No untracked `__generated__`, `generated`, `dist`, `build`, `.next`, or `.turbo` files were reported by `git ls-files --others --exclude-standard`.

## 14. Build Artifacts Accidentally Tracked

- Status: PASS
- Evidence:
  - tracked binary/build artifact scan found no matching files
  - no tracked files over 1 MiB found
- Recommendation: no action
- Reason: `.gitignore` already excludes common build artifacts including `dist/`, `build/`, `.next/`, `.turbo/`, `*.exe`, `*.dll`, `*.so`, `target/`, `.venv/`, and model/binary assets.

## 15. Large/Binary Files

- Status: PASS
- Evidence:
  - no tracked files over 1 MiB found by inspected size scan
  - no untracked files over 1 MiB or matching common binary extensions found
- Recommendation: no action

## 16. Secrets or Sensitive Files

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `config/.env.example` | tracked | P3 | keep | Example values only; not live secrets. |
| `infrastructure/kubernetes/apps/auth-service/values-prod.yaml` | tracked | P2 | review | Contains prod-like Postgres/Redis URLs and Vault secret references; no raw password found, but verify this is intended as non-secret config. |
| `.github/workflows/*.yml` | tracked | P3 | keep | Uses GitHub secrets references, not literal secret values. |
| `packages/events/src/producer.ts` and `consumer.ts` | tracked | P3 | keep | Type fields named `password`; no literal secret found in inspected output. |

No `.env` files other than `config/.env.example` were found by `rg --files -g '.env*'` excluding ignored tool dirs.

## 17. Lockfiles Changed

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `pnpm-lock.yaml` | modified | P1 | review / regenerate after manifest review | Lockfile changed with app/package dependency changes. |
| `go.work.sum` | tracked unchanged | P3 | no action | No Git change. |
| `Cargo.lock` | absent/untracked none | P2 | review policy | Root `.gitattributes` mentions Cargo.lock, but none is tracked or present. |
| `uv.lock` | absent/untracked none | P2 | review policy | Root `.gitattributes` mentions uv.lock, but none is tracked or present. |

## 18. Package Manager Changes

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `apps/immersive/package.json` | modified | P1 | review | Package renamed from `@next/immersive` to `@next/immersive-app` and build system changed to Vite. |
| `apps/studio/package.json` | modified | P1 | review | Adds many workspace package dependencies. |
| `apps/tv/package.json` | modified | P1 | review | Dependency reshaping for TV app. |
| `apps/web/package.json` | modified | P1 | review | Adds many UI/workspace dependencies. |
| `packages/design-system/package.json` | modified | P2 | review | Adds export. |
| `packages/layout-engine/package.json` | modified | P2 | review | Adds dependency. |
| `packages/ui/package.json` | modified | P2 | review | Adds dependencies. |
| `packages/*/package.json` new packages | untracked | P1 | review / split commit | 42 new package manifests found under untracked packages. |
| `pnpm-lock.yaml` | modified | P1 | regenerate / verify | Must correspond exactly to accepted package manifests. |

## 19. Go Module/Workspace Changes

- Status: REVIEW
- Git state:
  - `go.work`: tracked unchanged
  - `go.work.sum`: tracked unchanged
  - `services/*/go.mod`: no Git changes
  - `services/*/go.sum`: no Git changes
  - `packages/go/*/go.mod`: no Git changes
  - `packages/go/*/go.sum`: no Git changes
  - `gen/go/go.mod`: exists locally but ignored/untracked
  - `gen/go/go.sum`: exists locally but ignored/untracked
- Risk: P1
- Recommendation: review `gen/go` tracking/generation policy before commit.
- Reason: `go.work` includes `./gen/go`; local ignored generated module files may be masking a fresh-clone break.

## 20. Proto/Generated-Code Changes

- Status: REVIEW
- Git state:
  - no changed `*.proto` files reported
  - no changed `*.pb.go` files reported
  - ignored `gen/go/**` exists locally
- Risk: P1
- Recommendation: regenerate and verify from a clean clone or track required module boundary files.
- Reason: generated code is not shown as a Git change, but local ignored generated files affect build behavior.

## 21. Migration Changes

- Status: PASS
- Git state: no `migrations/*.sql` changes reported
- Risk: P3
- Recommendation: no action

## 22. Infrastructure/Terraform/Kubernetes Changes

- Status: PASS
- Git state: no current `infrastructure/**` changes reported
- Risk: P3
- Recommendation: no action for current Git state

## 23. CI/CD Workflow Changes

- Status: PASS
- Git state: no current `.github/workflows/**` changes reported
- Risk: P3
- Recommendation: no action for current Git state

## 24. Documentation-Only Changes

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `IMPLEMENTATION_STATUS.md` | untracked | P2 | commit separately after review | Status report, not product code. |
| `docs/AUDIT_CLAUDE.md` | untracked | P2 | commit separately or archive | Agent audit artifact. |
| `docs/AUDIT_CODEX.md` | untracked | P2 | commit separately or archive | Agent audit artifact from prior audit. |
| `docs/AUDIT_COPILOT.md` | untracked | P2 | commit separately or archive | Agent audit artifact. |
| `docs/AUDIT_Composer.md` | untracked | P2 | commit separately or archive | Agent audit artifact. |
| `docs/GIT_AUDIT_Composer.md` | untracked | P2 | commit separately or archive | Agent Git audit artifact. |
| `docs/community-experience/**` | untracked | P2 | docs commit | Community experience docs. |
| `docs/discovery-experience/**` | untracked | P2 | docs commit | Discovery experience docs. |
| `docs/immersive-design/**` | untracked | P2 | docs commit | Immersive design docs. |
| `docs/live-experience/**` | untracked | P2 | docs commit | Live experience docs. |
| `docs/mobile-experience/**` | untracked | P2 | docs commit | Mobile experience docs. |
| `docs/monetization-experience/**` | untracked | P2 | docs commit | Monetization experience docs. |
| `docs/onboarding-experience/**` | untracked | P2 | docs commit | Onboarding experience docs. |
| `docs/studio/**` | untracked | P2 | docs commit | Studio docs. |
| `docs/tv-experience/**` | untracked | P2 | docs commit | TV docs. |
| `docs/watch-experience/**` | untracked | P2 | docs commit | Watch docs. |

## 25. Agent-Created Files

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `docs/AUDIT_CLAUDE.md` | untracked | P2 | review | Audit artifact from another agent. |
| `docs/AUDIT_CODEX.md` | untracked | P2 | review | Audit artifact created by Codex. |
| `docs/AUDIT_COPILOT.md` | untracked | P2 | review | Audit artifact from another agent. |
| `docs/AUDIT_Composer.md` | untracked | P2 | review | Audit artifact from Composer. |
| `docs/GIT_AUDIT_Composer.md` | untracked | P2 | review | Git audit artifact from Composer. |
| `GIT_AUDIT_CODEX.md` | untracked after this report is written | P2 | review | This requested audit artifact. |

Recommendation: commit audit files in a separate docs/audit commit if they are part of the project record; otherwise keep them out of product commits.

## 26. Conflicting or Duplicated Files

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `docs/AUDIT_*.md` | untracked | P2 | review | Multiple independent audits may overlap; decide whether all are kept. |
| `docs/GIT_AUDIT_Composer.md` and `GIT_AUDIT_CODEX.md` | untracked | P2 | review | Multiple Git audits are useful for comparison but should be grouped or archived. |
| `apps/web/src/lib/demo-*.ts` and many route files | untracked | P2 | review | Demo data may duplicate backend contract intent. |
| Many new `packages/*-ui` packages | untracked | P2 | review | Large UI surface; ensure no duplicate components across packages. |

## 27. Files Likely Created by Local Tool Execution

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `node_modules/` | ignored local | P3 | ignore | Package install artifact. |
| `.turbo/` | ignored local | P3 | ignore | Turbo cache. |
| `.worktrees/**` | ignored local via `.git/info/exclude` | P3 | ignore | Local branch worktrees. |
| `.claude/**` | ignored local via `.gitignore` | P3 | ignore | Claude session/worktree state. |
| `gen/go/**` | ignored local | P1 | review | Generated code, but currently required by local Go workspace. |

## 28. Files Safe to Commit Now

Safe means "low Git hygiene risk", not "functionally verified".

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `docs/AUDIT_*.md` | untracked | P2 | commit separately if desired | Audit docs, no product runtime impact. |
| `docs/GIT_AUDIT_Composer.md` | untracked | P2 | commit separately if desired | Audit doc. |
| `GIT_AUDIT_CODEX.md` | untracked | P2 | commit separately if desired | This audit doc. |
| `IMPLEMENTATION_STATUS.md` | untracked | P2 | commit separately after review | Status doc. |
| `docs/*-experience/**` and `docs/design/*-motion-bridge.md` | untracked | P2 | commit as docs group after review | Documentation-only changes. |

## 29. Files Unsafe to Commit

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `node_modules/` | ignored | P3 | do not commit | Dependency install artifact. |
| `.turbo/` | ignored | P3 | do not commit | Cache artifact. |
| `.worktrees/**` | ignored | P3 | do not commit | Local Git worktree state. |
| `.claude/**` | ignored | P3 | do not commit | Agent/session state. |
| `gen/go/**` as-is | ignored | P1 | do not push blindly | Generated code policy is currently inconsistent with `go.work`; review before changing tracking. |
| `pnpm-lock.yaml` alone | modified | P1 | do not commit alone | Must be tied to package manifest changes. |

## 30. Files Requiring Review Before Commit

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| `apps/web/**` modified/untracked | mixed | P1 | review / split commit | Large surface area, demo data, many routes. |
| `apps/studio/**` modified/untracked | mixed | P1 | review / split commit | Large creator/studio surface area. |
| `apps/tv/**` modified/untracked | mixed | P1 | review / split commit | Vite/TV app additions. |
| `apps/immersive/**` modified/untracked | mixed | P1 | review / split commit | App package identity and build system changed. |
| `packages/**` modified/untracked | mixed | P1 | review / split commit | 538 untracked package files plus changed public exports/dependencies. |
| `packages/frontend-utils/src/telemetry/index.ts` | modified | P1 | privacy/security review | Telemetry changes can affect privacy and event taxonomy. |
| `pnpm-lock.yaml` | modified | P1 | regenerate/verify | Package manager lockfile must align with accepted package graph. |
| `gen/go/**` | ignored | P1 | review | Generated-code/workspace policy issue. |

## 31. Files That Should Be Reverted or Deleted

No automatic revert/delete recommendation can be made from Git state alone.

Review candidates:

| File/path | Git state | Risk | Recommendation | Reason |
|---|---|---|---|---|
| Duplicate or superseded audit docs | untracked | P2 | review, then keep one set or archive | Multiple audits may be intentionally useful, but can clutter docs. |
| Demo data files under `apps/web/src/lib/demo-*.ts` | untracked | P2 | review | Keep only if explicitly demo/placeholder scoped. |
| `gen/go/**` ignored local files | ignored | P1 | review, not delete blindly | May be required locally until generation workflow is fixed. |

## 32. Suggested Commit Groups

1. `docs(audit): add repository audit reports`
   - `docs/AUDIT_*.md`
   - `docs/GIT_AUDIT_Composer.md`
   - `GIT_AUDIT_CODEX.md`
   - `IMPLEMENTATION_STATUS.md` if accepted

2. `docs(experience): add product experience documentation`
   - `docs/community-experience/**`
   - `docs/discovery-experience/**`
   - `docs/immersive-design/**`
   - `docs/live-experience/**`
   - `docs/mobile-experience/**`
   - `docs/monetization-experience/**`
   - `docs/onboarding-experience/**`
   - `docs/studio/**`
   - `docs/tv-experience/**`
   - `docs/watch-experience/**`
   - `docs/design/*-motion-bridge.md`

3. `feat(ui-packages): add cross-surface UI package foundations`
   - new `packages/*-ui/**`
   - new `packages/*-layouts/**`
   - package tests/configs

4. `feat(web): add expanded NEXT experience routes`
   - `apps/web/src/app/**`
   - `apps/web/src/features/**`
   - `apps/web/src/lib/demo-*.ts`
   - `apps/web/package.json`

5. `feat(studio): expand creator studio experiences`
   - `apps/studio/src/app/**`
   - `apps/studio/src/features/**`
   - `apps/studio/package.json`

6. `feat(tv-immersive): add TV and immersive app shells`
   - `apps/tv/**`
   - `apps/immersive/**`

7. `feat(design-system): add spatial/theme/layout primitives`
   - `packages/design-system/**`
   - `packages/theme-system/**`
   - `packages/layout-engine/**`
   - `packages/animation-system/**`

8. `chore(deps): update pnpm workspace lockfile`
   - `pnpm-lock.yaml`
   - only after all package manifests in the same dependency batch are accepted

## 33. Suggested Commit Messages

- `docs(audit): add independent repository state audits`
- `docs(experience): document NEXT product experience surfaces`
- `feat(web): add expanded discovery, watch, live, and community routes`
- `feat(studio): add creator studio experience surfaces`
- `feat(tv): add television experience shell`
- `feat(immersive): add immersive experience shell`
- `feat(ui): add cross-surface product UI packages`
- `feat(design-system): add spatial tokens and cinematic motion primitives`
- `chore(deps): update pnpm lockfile for experience packages`

## 34. Suggested Pre-Push Checklist

Do not push until these pass or failures are explicitly documented:

1. `git status --short` shows only intended files.
2. Split staged changes by the commit groups above.
3. Review `pnpm-lock.yaml` against all changed `package.json` files.
4. Run `pnpm install --frozen-lockfile`.
5. Run `pnpm lint`.
6. Run `pnpm typecheck`.
7. Run `pnpm test`.
8. Run `pnpm build`.
9. Run `buf lint`.
10. Run module-aware Go tests for `services/*`, `packages/go/*`, and `gen/go` if present.
11. Resolve `gen/go` ignored/tracked policy.
12. Run secret scan or `gitleaks detect`.
13. Confirm no ignored/generated/build files are being staged.
14. Confirm no product commit includes audit files unless intended.
15. Confirm branch target: `develop` for integration, not direct `main`.

## 35. Risks If Pushed Now

| Risk | Priority | Reason |
|---|---|---|
| Dirty tree makes pushed branch incomplete or misleading | P0 | Current uncommitted changes would not be included unless committed first. |
| Branch has 10 commits ahead already | P1 | Push affects remote branch history and may mix architecture docs with new local work. |
| Package graph may be invalid | P1 | Many manifests and `pnpm-lock.yaml` changed. |
| Frontend build may fail | P1 | Large unverified app/package expansion. |
| Go workspace may fail on clean clone | P1 | `go.work` references ignored local `gen/go`. |
| Audit/docs may be mixed into product commits | P2 | Agent artifacts are untracked and should be separate. |
| Demo data may ship as product behavior | P2 | Many `demo-*.ts` files and placeholder UI packages are untracked. |
| Dependency lockfile may not match intended package set | P1 | Lockfile changed with many untracked package manifests. |

## 36. Exact Next Steps

1. Do not push this branch yet.
2. Decide whether audit files should live in the repository.
3. If yes, stage audit files separately and commit them with a docs-only message.
4. Review and resolve the `gen/go` ignore problem before backend verification.
5. Review all new package manifests and align `pnpm-lock.yaml`.
6. Split frontend/app/package/docs changes into logical commits.
7. Run the pre-push checklist.
8. Push only after the branch is clean and verification status is known.

## 37. Command Evidence

Read-only commands used included:

- `git status --branch --short`
- `git branch --show-current`
- `git branch -vv`
- `git remote -v`
- `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- `git status --porcelain=v1`
- `git diff --stat`
- `git diff --name-status`
- `git diff --name-only`
- `git diff --cached --name-status`
- `git ls-files --others --exclude-standard`
- `git ls-files -c -i --exclude-standard`
- `git ls-files`
- `git log --oneline -10`
- `git log --graph --oneline --decorate -20`
- `git check-ignore -v`
- `rg --files`
- `rg -n` for secret-pattern inspection

