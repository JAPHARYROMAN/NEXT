# PHASE 11 EXIT AUDIT - CODEX

Date: 2026-05-20  
Workspace: `C:\projects\Actual Projects\next`  
Agent: Codex  
Audit mode: inspect, verify, and report only  
Final verdict: **NOT COMPLETE**

## 1. Executive Summary

Phase 11 is not complete. The repository has meaningful stabilization progress, but it does not yet meet the exit bar for clean branch discipline, green verification, CI readiness, or clean git state.

Key evidence:

- `agent/claude-architecture` is pushed to `origin`, but its branch range includes `apps/`, `packages/`, `services/`, `ai/`, `go.work`, and `pnpm-lock.yaml`, not only architecture/docs. Risk: P0. Action: split or rebuild the Claude branch so it contains architecture/docs-only commits.
- `agent/composer-frontend` exists locally and contains logical frontend commits, but no remote `origin/agent/composer-frontend` ref was found. Risk: P1. Action: push only after verification and review.
- Current branch is `agent/composer-frontend`; it has no upstream tracking branch and has modified/untracked files. Nothing is staged. Risk: P0. Action: stop feature work and split stabilization changes into reviewed commits.
- Verification is mixed: `pnpm install --frozen-lockfile`, `buf lint`, `task codegen`, `task test:go`, Rust `cargo test --workspace`, and Terraform environment `validate` pass. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `terraform fmt -check`, and Python `uv run pytest ai/` fail. Risk: P0. Action: fix the red verification gates before merge or push readiness.
- Codegen policy exists locally in `docs/git/generated-code-policy.md` and `.gitignore`, but the policy files and `gen/go/go.mod` / `gen/go/go.sum` are still untracked, and CI does not enforce `buf generate` drift checks. Risk: P1. Action: commit the policy intentionally and update CI.
- Repo hygiene safeguards exist locally (`scripts/hygiene/*`, `.husky/pre-commit`, docs), but many are untracked. Risk: P1. Action: review and commit guardrails separately.
- CI is not Phase 11 ready. `.github/workflows/ci.yml` only runs on `main`, Go CI does not test `packages/go/*`, proto CI lacks generation drift checking, and Terraform CI validates modules but not environments. Risk: P1. Action: update CI coverage.

Confidence level: **High** for git state, branch isolation, and verification results. **Medium** for secret scanning because this audit used high-signal local scans, not a full gitleaks run.

## 2. Checklist Table

| Gate | Status | Evidence | Risk | Recommended action |
|---|---:|---|---:|---|
| 1. Claude docs branch pushed | PASS | `git ls-remote --heads origin agent/claude-architecture` returned `0f84ea2... refs/heads/agent/claude-architecture`. | P3 | Keep remote branch available for review. |
| 1. No accidental frontend/app/package files on Claude branch | FAIL | `git diff --name-only d97d8b1..origin/agent/claude-architecture` includes `apps/*`, `packages/*`, `services/*`, `ai/*`, `go.work`, `pnpm-lock.yaml`. | P0 | Rebuild or split Claude branch so architecture/docs work is isolated. |
| 1. Docs commits clean and reviewable | PARTIAL | Latest docs commits are cleanly named, but same range also includes `feat(design)` and `feat(recommendation)` mixed-domain commits. | P1 | Keep docs commits; move non-doc commits to proper owner branches. |
| 2. Composer frontend WIP moved to Composer branch | PARTIAL | Current branch `agent/composer-frontend` contains frontend commits from `334cc2a` through `a003a66`. | P1 | Push branch only after verification and review. |
| 2. No frontend WIP remains on Claude branch | FAIL | Claude range includes many `apps/web`, `apps/studio`, `apps/admin`, `packages/ui`, and design package files. | P0 | Remove frontend commits from Claude branch or create a corrected docs branch. |
| 2. Composer commits split logically | PASS | `git log --oneline 0f84ea2..agent/composer-frontend` shows separate UI/design/web/studio/tv/deps commits. | P2 | Preserve commit grouping during cleanup. |
| 2. `pnpm-lock.yaml` paired with package changes | PASS | Composer range includes `pnpm-lock.yaml` plus matching `package.json` changes across apps/packages. | P2 | Review lockfile with package changes before push. |
| 3. Current branch identified | PASS | `git branch --show-current` -> `agent/composer-frontend`. | P3 | None. |
| 3. Upstream identified | FAIL | `git branch -vv` shows no upstream marker for current `agent/composer-frontend`; `ls-remote` has no `origin/agent/composer-frontend`. | P1 | Set upstream after the branch is clean and ready. |
| 3. Staged files checked | PASS | `git diff --cached --name-status` returned no output. | P3 | Keep no staged files during stabilization audit. |
| 3. Modified files checked | FAIL | `git status --short` lists modified `.gitignore`, `.husky/pre-commit`, `.mise.toml`, `Cargo.toml`, `Taskfile.yml`, proto files, Go/Rust files, Terraform variable file. | P0 | Split into stabilization commits or restore if not needed. |
| 3. Untracked files checked | FAIL | `git status --short` lists `Cargo.lock`, docs audits, docs/git, docs/stabilization, `gen/`, Terraform lockfiles, `rust-toolchain.toml`, scripts, `uv.lock`, `v3/`. | P0 | Classify each as commit, ignore, or delete in reviewed cleanup. |
| 3. Ignored files checked | PARTIAL | `git status --short --ignored` shows `.venv/`, `target/`, `gen/go/auth/`, `packages/api-client/src/__generated__/` ignored. | P2 | Add policy for `v3/` and Terraform lockfiles. |
| 3. No accidental build artifacts staged/tracked | PASS | No staged files; tracked binary-extension scan produced no output. | P2 | Keep build artifacts ignored. |
| 3. No secrets staged/tracked | PARTIAL | High-signal scan for `AKIA...` and `PRIVATE KEY` produced no output; full secret scan not run. | P1 | Run gitleaks or equivalent before push. |
| 4. `pnpm install --frozen-lockfile` | PASS | Command completed: `Lockfile is up to date`, `Done in 5s`. | P3 | None. |
| 4. `pnpm lint` | FAIL | Fails with `'eslint' is not recognized` in packages such as `@next/database`, `@next/feature-flags`, `@next/feed-types`, `@next/icons`, `@next/logger`, `@next/media-events`, `@next/security-utils`, `@next/telemetry`. | P0 | Fix package dependency/script resolution for eslint. |
| 4. `pnpm typecheck` | FAIL | Fails at `@next/config#typecheck`; `tsc --noEmit` prints compiler help, indicating missing project config or wrong script. | P0 | Add package tsconfig or remove inappropriate typecheck script. |
| 4. `pnpm test` | FAIL | Fails at `@next/upload-sdk#test` and `@next/streaming-utils#test`: `No test files found, exiting with code 1`. | P1 | Add tests or configure empty-test handling intentionally. |
| 4. `pnpm build` | FAIL | Fails at `@next/live-control-room#build` and `@next/studio-media-console#build`: missing `pages` or `app` directory. | P0 | Exclude placeholders from build or add proper app structure in frontend branch. |
| 4. `buf lint` | PASS | `buf lint` exited 0. | P3 | Keep in CI. |
| 4. `buf generate` / codegen drift check | PARTIAL | `task codegen` passed, but CI lacks a generation drift check. | P1 | Add `buf generate` plus clean diff check to CI. |
| 4. Go module-aware tests for `services/*` | PASS | `task test:go` passed and skipped scaffold services with no Go packages. | P2 | Decide whether skipped services are acceptable. |
| 4. Go tests for `packages/go/*` | PASS local, FAIL CI | `task test:go` tests `packages/go/auth`, `database`, `eventbus`, `telemetry`; CI only loops through `services/*`. | P1 | Update CI Go job to include shared Go packages. |
| 4. Terraform fmt/validate | PARTIAL | `terraform validate` passes for dev/prod environments; `terraform fmt -check -recursive infrastructure` fails on six files. | P1 | Run fmt in a dedicated stabilization commit. |
| 4. Rust cargo test | PASS | `cargo test --workspace` passed under rustc/cargo 1.91.1 after native prereqs. | P2 | Document Windows Perl/CMake/native prerequisites. |
| 4. Python pytest | FAIL | `uv run pytest ai/` exits 1 with `collected 0 items`, `no tests ran`. | P1 | Add tests or document empty Python test status with CI behavior. |
| 5. `gen/go` policy resolved | PARTIAL | `.gitignore` and `docs/git/generated-code-policy.md` define policy, but policy docs and module files are untracked. | P1 | Commit policy and `gen/go/go.mod` / `gen/go/go.sum` if approved. |
| 5. `go.work` no longer silently depends on ignored generated files | PARTIAL | `gen/go/go.mod` and `gen/go/go.sum` are visible as untracked; generated `gen/go/auth/` is ignored. | P1 | Track only module boundary files and enforce generation before Go tests. |
| 6. Binary/build artifact protection exists | PARTIAL | `.gitignore`, `.husky/pre-commit`, and `scripts/hygiene/check-no-binaries.sh` exist locally; scripts are untracked. | P1 | Commit guardrails separately after review. |
| 6. Service layout validation exists or planned | PARTIAL | `scripts/hygiene/validate-service-layout.sh` and `service-exceptions.txt` exist locally but are untracked. | P2 | Commit and wire into CI or pre-push. |
| 6. Pre-push checklist exists | PARTIAL | `docs/git/pre-push-checklist.md` exists locally but is untracked. | P2 | Commit docs after review. |
| 6. Safe commit workflow documented | PARTIAL | `docs/git/safe-commit-workflow.md` exists locally and discourages broad staging, but is untracked. | P2 | Commit docs after review. |
| 7. CI reflects stabilization checks | FAIL | `.github/workflows/ci.yml` runs only on `main`; current agent branches are not protected by this workflow. | P1 | Expand branch triggers or require PR checks into integration branches. |
| 7. CI includes shared Go packages | FAIL | CI Go job only loops `services/*`; it does not run `packages/go/*`. | P1 | Reuse `scripts/go-work-run.mjs` or equivalent in CI. |
| 7. CI includes buf lint | PASS | `.github/workflows/ci.yml` uses `bufbuild/buf-lint-action@v1`. | P3 | Keep. |
| 7. CI includes frontend checks | PARTIAL | TypeScript job runs `pnpm turbo run lint typecheck test build`, but only on `main` PR/push and currently fails locally. | P1 | Fix frontend checks and branch protection. |
| 7. CI does not skip critical verification | FAIL | CI lacks `buf generate` drift check, shared Go package tests, and environment Terraform validation. | P1 | Add missing checks. |
| 8. Branch discipline | FAIL | Claude branch is mixed-domain; Composer branch is local-only; stabilization changes are dirty on Composer branch. | P0 | Split branches by owner before merging. |
| 9. Remaining blockers listed | PASS | See section 6. | P3 | Use as stabilization backlog. |
| 10. Final verdict | FAIL | Multiple P0 gates remain. | P0 | Phase 11 exit should not be marked complete. |

## 3. Detailed Findings

### Gate 1 - Claude Docs Branch

Status: **FAIL**

Evidence:

- Command: `git ls-remote --heads origin agent/claude-architecture`
- Output: `0f84ea27924a98f44be0baa6843e2c419e014c24 refs/heads/agent/claude-architecture`
- Command: `git log --oneline d97d8b1286abb1f16b3914c0e1cba4b8f400871d..origin/agent/claude-architecture`
- Output includes docs commits, but also `53a8136 feat(design): phase 6 cinematic experience layer` and `bdc859d feat(recommendation): discovery intelligence - funnel, modes, fairness`.
- Command: `git diff --name-only d97d8b1286abb1f16b3914c0e1cba4b8f400871d..origin/agent/claude-architecture`
- Output includes `apps/admin/*`, `apps/studio/*`, `apps/web/*`, `packages/*`, `services/*`, `ai/*`, `go.work`, `pnpm-lock.yaml`.

Findings:

- The branch is pushed.
- It is not docs-only or architecture-only.
- It contains domain work that belongs to Composer, Codex, or AI/service owners.

Risk: **P0**

Recommended action:

- Create a clean replacement docs branch from the correct base, cherry-picking only architecture/docs commits.
- Move frontend, service, AI, and package commits to their owner branches.

### Gate 2 - Composer Frontend Isolation

Status: **PARTIAL**

Evidence:

- Current branch: `agent/composer-frontend`.
- Command: `git log --oneline 0f84ea27924a98f44be0baa6843e2c419e014c24..agent/composer-frontend`
- Output shows seven logical frontend commits:
  - `334cc2a feat(ui): add experience ui packages and extend core primitives`
  - `22b50a9 feat(design): expand tokens, motion, and layout engine foundations`
  - `dd3a5ca feat(ui): add client stores and telemetry for experience surfaces`
  - `ee5822a feat(web): ship cinematic routes, features, and experience docs`
  - `366bfb3 feat(studio): expand creator studio routes and feature modules`
  - `c3f8d52 feat(tv): add tv, immersive, and mobile app shells`
  - `a003a66 build(deps): sync workspace lockfile and package wiring`
- Command: `git ls-remote --heads origin agent/composer-frontend` returned no ref.
- Composer range includes `pnpm-lock.yaml` plus many matching `package.json` changes.

Findings:

- Composer WIP is isolated locally.
- It is not pushed or upstream tracked.
- The current dirty working tree includes additional stabilization changes on top of this frontend branch.
- Claude branch still contains frontend WIP, so the isolation is incomplete at the repository level.

Risk: **P1**

Recommended action:

- Keep Composer work local until verification is green or explicitly marked WIP.
- Push with upstream only after branch review.
- Remove or supersede the mixed frontend content from Claude branch history.

### Gate 3 - Git Cleanliness

Status: **FAIL**

Evidence:

- Command: `git branch --show-current`
- Output: `agent/composer-frontend`
- Command: `git status --branch --short`
- Output starts with `## agent/composer-frontend`, no upstream marker.
- Command: `git diff --cached --name-status`
- Output: no staged files.
- Modified files:
  - `.gitignore`
  - `.husky/pre-commit`
  - `.mise.toml`
  - `Cargo.toml`
  - `Taskfile.yml`
  - `infrastructure/terraform/modules/opensearch/variables.tf`
  - `packages/api-client/codegen.ts`
  - `packages/events/schemas/auth/v1/user_registered.proto`
  - `packages/events/schemas/media/v1/processing_stage.proto`
  - `packages/events/schemas/media/v1/video_published.proto`
  - `packages/go/eventbus/eventbus.go`
  - `packages/rust/telemetry/src/lib.rs`
  - `services/profile-service/internal/store/postgres.go`
- Untracked files include `Cargo.lock`, `docs/AUDIT_*`, `docs/GIT_AUDIT_*`, `docs/PHASE_11_EXIT_AUDIT_*`, `docs/git/`, `docs/stabilization/`, `gen/`, Terraform environment lockfiles, `rust-toolchain.toml`, `scripts/go-work-run.mjs`, `scripts/hygiene/`, `uv.lock`, `v3/`.
- Ignored files include `.venv/`, `target/`, `gen/go/auth/`, `packages/api-client/src/__generated__/`.

Findings:

- No files are staged.
- The working tree is dirty.
- Some untracked files are likely intended stabilization outputs; others are local tool artifacts that need ignore/delete policy.

Risk: **P0**

Recommended action:

- Do not push this branch as-is.
- Split stabilization changes by concern.
- Decide whether `Cargo.lock`, `rust-toolchain.toml`, `uv.lock`, Terraform lockfiles, `gen/go/go.mod`, and `gen/go/go.sum` are intentionally tracked.
- Ignore or delete `v3/` if it is Buf cache output.

### Gate 4 - Verification Health

Status: **FAIL**

Evidence and results:

| Command | Result | Key output |
|---|---:|---|
| `pnpm install --frozen-lockfile` | PASS | `Lockfile is up to date`, `Already up to date`, `Done in 5s`. |
| `pnpm lint` | FAIL | Multiple packages fail with `'eslint' is not recognized as an internal or external command`. |
| `pnpm typecheck` | FAIL | `@next/config#typecheck` fails; `tsc --noEmit` prints compiler help. |
| `pnpm test` | FAIL | `@next/upload-sdk#test` and `@next/streaming-utils#test` fail with `No test files found, exiting with code 1`. |
| `pnpm build` | FAIL | `@next/live-control-room#build` and `@next/studio-media-console#build` fail because no `pages` or `app` directory exists. |
| `buf lint` | PASS | Exit 0. |
| `task codegen` | PASS | `@next/api-client:codegen` and `@next/events:codegen` completed from cache; `task: Task "codegen:proto" is up to date`. |
| `task test:go` | PASS | Tests `gen/go`, `packages/go/*`, and service modules; skips scaffold services with no Go packages. |
| `terraform fmt -check -recursive infrastructure` | FAIL | Six files require formatting. |
| `terraform -chdir=infrastructure\terraform\environments\dev validate` | PASS | `Success! The configuration is valid.` |
| `terraform -chdir=infrastructure\terraform\environments\prod validate` | PASS | `Success! The configuration is valid.` |
| `cargo test --workspace` | PASS | Rust tests and doctests complete successfully under rustc/cargo 1.91.1. |
| `uv run pytest ai/` | FAIL | `collected 0 items`, `no tests ran`, exit 1. |

Terraform files failing format:

- `infrastructure\terraform\environments\prod\main.tf`
- `infrastructure\terraform\modules\cloudfront\main.tf`
- `infrastructure\terraform\modules\elasticache-redis\variables.tf`
- `infrastructure\terraform\modules\rds-postgres\main.tf`
- `infrastructure\terraform\modules\vpc\main.tf`
- `infrastructure\terraform\modules\vpc\variables.tf`

Findings:

- Backend Go/proto/Rust verification is in better condition than frontend package verification.
- Frontend verification is not green.
- Terraform validate is green, but fmt is not.
- Python test command fails because the suite is empty.

Risk: **P0**

Recommended action:

- Fix verification from the top of the dependency chain: package manager/lint resolution, `@next/config` typecheck, empty Vitest suites, placeholder Next apps, Terraform fmt, Python empty-test policy.

### Gate 5 - Codegen Policy

Status: **PARTIAL**

Evidence:

- `.gitignore` contains generated-code rules:
  - `**/__generated__/`
  - `**/generated/`
  - `**/gen/`
  - `!gen/`
  - `!gen/go/`
  - `gen/go/**`
  - `!gen/go/go.mod`
  - `!gen/go/go.sum`
- `docs/git/generated-code-policy.md` exists locally and documents that `gen/go/**` output is untracked except `gen/go/go.mod` and `gen/go/go.sum`.
- Command: `git status --short --ignored -- gen/go/go.mod gen/go/go.sum gen/go/auth/v1/auth.pb.go packages/api-client/src/__generated__ target`
- Output:
  - `?? gen/go/go.mod`
  - `?? gen/go/go.sum`
  - `!! gen/go/auth/`
  - `!! packages/api-client/src/__generated__/`
  - `!! target/`
- `.github/workflows/ci.yml` does not run `buf generate` plus clean-diff check.

Findings:

- The local policy direction is sound.
- It is not fully committed or enforced.
- `gen/go/go.mod` and `gen/go/go.sum` remain untracked, so a clean clone may still not have the intended Go module boundary unless CI regenerates before tests.

Risk: **P1**

Recommended action:

- Commit codegen policy in a dedicated stabilization commit.
- Track only the approved `gen/go` module files if accepted.
- Update CI to run generation before Go checks and fail on unexpected tracked drift.

### Gate 6 - Repo Hygiene Safeguards

Status: **PARTIAL**

Evidence:

- `.husky/pre-commit` now invokes `scripts/hygiene/check-no-binaries.sh`.
- `scripts/hygiene/check-no-binaries.sh` exists locally but is untracked.
- `scripts/hygiene/validate-service-layout.sh` exists locally but is untracked.
- `docs/git/pre-push-checklist.md`, `docs/git/safe-commit-workflow.md`, and `docs/git/generated-code-policy.md` exist locally but are untracked.
- Tracked binary-extension scan produced no output:
  - Command: `git ls-files | rg '\.(exe|dll|so|dylib|bin|zip|tar|gz|7z|mp4|mov|webm|png|jpg|jpeg|pdf|wasm)$'`

Findings:

- Guardrails exist in the worktree but are not yet part of the repository.
- The binary and generated-code policies need to become committed and CI-backed.
- The current working tree includes local generated/tool artifacts that need classification.

Risk: **P1**

Recommended action:

- Commit hygiene scripts/docs in a dedicated repo-stabilization commit.
- Wire service layout validation into CI or a pre-push script.
- Add a policy for Buf cache `v3/` and Terraform lockfiles.

### Gate 7 - CI Readiness

Status: **FAIL**

Evidence:

- File inspected: `.github/workflows/ci.yml`.
- CI triggers only:
  - `pull_request: branches: [main]`
  - `push: branches: [main]`
- Go job path filter includes `packages/go/**`, but job command only loops through `services/*`.
- Proto job runs Buf lint and breaking check, but not `buf generate` plus drift check.
- Terraform job runs `terraform fmt -check -recursive infrastructure/terraform` and validates modules only. Local environment validation passed, but CI does not validate environments.
- TypeScript job has relevant frontend commands, but local `pnpm lint`, `typecheck`, `test`, and `build` are failing.

Findings:

- CI is not yet equivalent to the Phase 11 stabilization checklist.
- Several critical checks can be missed.
- Agent branches can diverge without CI signal unless routed through `main` PRs.

Risk: **P1**

Recommended action:

- Add CI coverage for `develop` and agent/integration PRs.
- Replace custom Go service loop with the module-aware workspace test script.
- Add proto generation drift check.
- Add Terraform environment validation or make the validate target explicit.

### Gate 8 - Branch Discipline

Status: **FAIL**

Evidence:

- `agent/claude-architecture` contains docs, frontend, AI, packages, and services.
- `agent/composer-frontend` is local-only and contains frontend WIP.
- Current dirty stabilization files are on `agent/composer-frontend`, including backend/proto/Rust/Terraform/tooling changes.
- `git branch -vv` shows Codex phase worktree branches (`agent/codex-backend-phase12`, `phase18`, `phase24`, `phase26`, `phase30`) all pointing at `d97d8b1` and attached to local `.worktrees`.

Findings:

- Branch ownership is not clean enough for Phase 11 exit.
- Current stabilization changes are not on an obvious Codex/backend-stabilization branch.
- There are no staged files, but the dirty worktree would be risky to push or merge.

Risk: **P0**

Recommended action:

- Freeze feature implementation.
- Create or switch to a dedicated stabilization branch before committing stabilization changes.
- Keep Composer branch frontend-only and Claude branch docs-only.

## 4. Top Risks

### P0 Blockers

1. Claude branch is mixed-domain and not docs-only.
2. Current working tree is dirty with modified and untracked stabilization/tooling files.
3. Frontend verification is red: lint, typecheck, test, and build fail.
4. Placeholder Next apps are included in build but lack `pages` or `app` directories.
5. Branch discipline is not clean: stabilization changes currently sit on Composer branch.

### P1 Blockers

1. `agent/composer-frontend` has no remote branch or upstream.
2. CI does not run on `develop` or agent branches.
3. CI Go job skips shared `packages/go/*` tests.
4. CI proto job lacks generation drift check.
5. Codegen policy exists locally but is untracked and not enforced.
6. Repo hygiene scripts/docs exist locally but are untracked.
7. Terraform fmt fails.
8. Python pytest fails because no tests are collected.
9. `v3/` appears as untracked local output and needs ignore/delete policy.
10. Terraform environment lockfiles are untracked and need an explicit tracking policy.
11. `gen/go/go.mod` and `gen/go/go.sum` are untracked despite being intended exceptions.
12. High-signal secret scan is clean, but full secret scan is not yet documented as run.

### P2 Blockers

1. Some Go services are skipped by `task test:go` because they have no Go packages.
2. Rust tests pass but only contain empty test suites; native Windows prerequisites should be documented.
3. Next.js `experimental.typedRoutes` warnings remain in several apps.
4. Vite sourcemap warnings appear in TV/immersive builds before the build fails elsewhere.
5. Coverage is low or zero in many Go packages even when tests pass.

### Nice-to-Have Cleanup

1. Normalize verification command docs into one root stabilization playbook.
2. Add a no-`git add .` pre-push checklist to CI docs once reviewed.
3. Add an explicit cleanup command for local generated artifacts.
4. Add branch naming and worktree retirement documentation.

## 5. Top Recommended Fixes

1. Rebuild `agent/claude-architecture` from the correct base with docs/architecture commits only.
2. Keep `agent/composer-frontend` local until frontend verification is green or clearly marked WIP.
3. Move stabilization changes off Composer branch onto a dedicated stabilization branch before committing.
4. Fix eslint availability for package lint scripts.
5. Fix `@next/config` typecheck by adding a package tsconfig or removing the invalid script.
6. Add tests or intentional empty-test handling for `@next/upload-sdk` and `@next/streaming-utils`.
7. Remove placeholder Next apps from `pnpm build` or give them valid `app`/`pages` structure in the frontend branch.
8. Run `terraform fmt` on the listed files in a dedicated stabilization commit.
9. Decide and document whether Terraform provider lockfiles are tracked.
10. Add Python tests or configure/document empty Python test behavior.
11. Commit `docs/git/generated-code-policy.md` after review.
12. Commit or intentionally reject `gen/go/go.mod` and `gen/go/go.sum`.
13. Add `buf generate` plus clean-diff check to CI.
14. Update CI Go job to test `packages/go/*` and services through the same module-aware script used locally.
15. Add service layout validation to CI or pre-push.
16. Commit binary/build artifact guardrails after review.
17. Ignore or delete `v3/` if it is local Buf cache.
18. Run a full secret scan before push.
19. Review untracked audit documents and decide which should be committed.
20. Only push after the branch is clean and verification red gates are either fixed or explicitly accepted as known non-blockers.

## 6. MVP Readiness / Exit Verdict

Phase 11 exit verdict: **NOT COMPLETE**

Reason:

- Multiple P0 gates are still open.
- Branch isolation has not been fully corrected.
- Verification is not green.
- CI does not yet enforce the stabilization checklist.
- The current git state is dirty and unreviewed.

MVP readiness impact:

- MVP readiness remains blocked by repository hygiene and verification reliability, not by missing product features.
- The repository should remain in stabilization mode until the P0 and P1 items above are resolved.

## 7. Commands Run or Inspected

Git and branch:

```powershell
git branch --show-current
git status --branch --short
git branch -vv
git remote -v
git diff --cached --name-status
git status --short
git ls-remote --heads origin agent/claude-architecture agent/composer-frontend agent/codex-backend agent/copilot-utilities develop main
git log --oneline --decorate -20
git diff --name-only d97d8b1286abb1f16b3914c0e1cba4b8f400871d..origin/agent/claude-architecture
git diff --name-status 0f84ea27924a98f44be0baa6843e2c419e014c24..agent/composer-frontend
git diff --stat
```

Verification:

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
buf lint
task codegen
task test:go
terraform fmt -check -recursive infrastructure
terraform -chdir=infrastructure\terraform\environments\dev validate
terraform -chdir=infrastructure\terraform\environments\prod validate
cargo test --workspace
uv run pytest ai/
```

Hygiene:

```powershell
git ls-files | rg '\.(exe|dll|so|dylib|bin|zip|tar|gz|7z|mp4|mov|webm|png|jpg|jpeg|pdf|wasm)$'
git ls-files | rg '(^|/)gen/' | rg -v '^gen/go/go\.(mod|sum)$'
rg -n -I 'AKIA[0-9A-Z]{16}|PRIVATE KEY' . --glob '!node_modules/**' --glob '!target/**' --glob '!v3/**' --glob '!pnpm-lock.yaml' --glob '!Cargo.lock'
git status --short --ignored -- gen/go/go.mod gen/go/go.sum gen/go/auth/v1/auth.pb.go packages/api-client/src/__generated__ target
```

## 8. Questions and Assumptions

1. Assumption: `d97d8b1286abb1f16b3914c0e1cba4b8f400871d` is the backend/develop base for measuring Claude branch drift because it is the shared `develop`/`agent/codex-backend` commit shown locally.
2. Assumption: `0f84ea27924a98f44be0baa6843e2c419e014c24` is the Claude branch tip used as the Composer branch base.
3. Question: Should Terraform `.terraform.lock.hcl` files be tracked for each environment or ignored in this repo?
4. Question: Should `Cargo.lock` be tracked at the root for this mixed application workspace?
5. Question: Should `uv.lock` be tracked now that `uv run pytest ai/` creates it?
6. Question: Is `v3/` a Buf cache folder that should be ignored, or an intended tracked source folder?
7. Question: Should scaffold services with no Go packages remain in `go.work`, or should they be excluded until implementation begins?

