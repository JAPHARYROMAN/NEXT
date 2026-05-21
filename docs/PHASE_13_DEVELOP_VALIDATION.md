# NEXT — Phase 13 Develop Validation Follow-Up

**Branch:** `agent/codex-stabilization`
**Base:** `develop` at `b70f50a`
**Scope:** Phase 13 blocker fix for `services/api-gateway` Go verification.

## Verdict

`services/api-gateway` is now generated, compiled, and tested by the Go workspace verification path.

The previous Phase 13 blocker had two parts:

1. `scripts/go-work-run.mjs` silently skipped modules that failed `go list` because generated packages were missing.
2. `services/api-gateway/internal/gql/resolver/schema.resolvers.go` could be corrupted by gqlgen because resolver helper code lived inside the regenerated resolver file and a custom multi-line Go comment was preserved incorrectly.

Both are resolved on this branch.

## Fix Summary

- Added `codegen:gqlgen` to `Taskfile.yml`.
- Wired `test:go` to run both proto and gqlgen codegen before Go workspace tests.
- Hardened `scripts/go-work-run.mjs` so unresolved generated packages fail instead of being skipped.
- Moved API gateway resolver helper functions into `services/api-gateway/internal/gql/resolver/helpers.go`.
- Left `services/api-gateway/internal/gql/generated/` untracked, because it is generated output ignored by repository policy.
- Reduced the `Me` resolver comment to the gqlgen-safe generated comment so regeneration stays stable.

## Verification Results

| Command                                   | Result |
| ----------------------------------------- | ------ |
| `task codegen`                            | PASS   |
| `go test ./...` in `services/api-gateway` | PASS   |
| `node scripts/go-work-run.mjs test ./...` | PASS   |
| `buf lint`                                | PASS   |

## API Gateway Coverage

`node scripts/go-work-run.mjs test ./...` now includes:

```txt
==> ./services/api-gateway: go test -coverprofile=coverage.out ./...
github.com/next-ecosystem/next/services/api-gateway/cmd/server
github.com/next-ecosystem/next/services/api-gateway/internal/authz
github.com/next-ecosystem/next/services/api-gateway/internal/gql/generated
github.com/next-ecosystem/next/services/api-gateway/internal/gql/model
github.com/next-ecosystem/next/services/api-gateway/internal/gql/resolver
```

The old `skipped: unresolved generated package` path has been removed.

## Generated Output Policy

Generated GraphQL server code is not committed:

- `services/api-gateway/internal/gql/generated/generated.go` is produced by `task codegen`.
- `.gitignore` ignores it through `**/generated/`.
- The tracked source of truth remains `services/api-gateway/schema/schema.graphqls`, `services/api-gateway/gqlgen.yml`, and the handwritten resolver files.

## Main Eligibility

This blocker no longer prevents main promotion. Main eligibility still depends on the remaining Phase 13 gates, especially independent Rust CI confirmation on Ubuntu.

---

## Independent Review (Claude) — 2026-05-20

Codex's fix `8b7648e fix(api-gateway): restore go verification` (on `agent/codex-stabilization`,
= `develop`@`b70f50a` + 1 commit) was independently re-verified in a clean worktree at `8b7648e`.

### Review checklist

| #   | Check                                                               | Result  | Evidence                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | api-gateway no longer silently skipped                              | ✅ PASS | With `internal/gql/generated/` removed, `node scripts/go-work-run.mjs test ./...` **exits 1** (throws on the unresolved package) instead of skipping. After codegen, the run prints `==> ./services/api-gateway: go test …` — it is in the tested set.                                    |
| 2   | gqlgen / codegen policy respected                                   | ✅ PASS | `git ls-files …/internal/gql/generated` → 0 tracked files; `go -C services/api-gateway run github.com/99designs/gqlgen generate` (= `codegen:gqlgen`) regenerates `generated.go`, exit 0. Generated output stays git-ignored via `**/generated/`.                                         |
| 3   | `go-work-run.mjs` returns nonzero on real runnable-service failures | ✅ PASS | Codex removed the `no required module provides package → skip` branch; the runner now falls through to `throw error` → process exits 1. Verified: pre-codegen run exited 1. `go test` failures also propagate (`execFileSync` throws).                                                    |
| 4   | `services/api-gateway` passes `go test ./...`                       | ✅ PASS | `cd services/api-gateway && go test ./...` → exit 0; all 5 packages compile. The mangled `Me` doc comment is fixed and the previously-undefined helpers (`derefString`, `translateGRPCError`, `tryFetchProfile`, `toFollowersConnection`) now live in `internal/gql/resolver/helpers.go`. |
| 5   | This report updated                                                 | ✅ PASS | This section.                                                                                                                                                                                                                                                                             |

### Post-codegen workspace run

`node scripts/go-work-run.mjs test ./...` after `codegen:gqlgen` → **exit 0**; api-gateway tested
(5 packages), genuine scaffolds explicitly reported as `skipped: no Go packages`.

### Residual note on the runner

Codex's minimal change (delete the bad skip branch) satisfies criterion 3. One edge remains: a
real service whose `go list` returns _"matched no packages"_ would still be skipped silently — not
the observed bug, but worth a follow-up (a `hasGoSource` guard would close it). Non-blocking.

### Phase 13 status after this review

- **Blocker B-3 (api-gateway does not compile)** — ✅ **RESOLVED & VERIFIED** on
  `agent/codex-stabilization` @ `8b7648e`.
- **Important:** `8b7648e` is **not yet on `develop`**. `develop` (`b70f50a`) still contains the
  broken api-gateway — the verified fix must be integrated into `develop` (Phase-12-style merge)
  before `develop` itself is sound.
- **Blocker B-1 (Rust job on Ubuntu)** — ❌ still **UNCONFIRMED**. `ci.yml` is `main`-only and has
  never run for `develop`; the latest run skipped the `rust` job.

**Overall verdict: NOT MAIN READY.** B-3's fix is verified but not integrated into `develop`;
B-1 is unconfirmed. Next: integrate `8b7648e` into `develop`, then confirm the Rust job green on
Ubuntu via the `develop → main` PR's `ci.yml` run.

_Independent review: no product code modified; nothing merged; `develop`/`main` not updated._

---

## Phase 13 Final Main-Readiness Check (Claude) — 2026-05-20

### develop final SHA

`origin/develop` = **`8b7648e8ad5044318a9a1b37db80feea1b52c976`**. The api-gateway fix is now **on
`develop`** — `develop` and `agent/codex-stabilization` point to the same commit `8b7648e`.

### Can GitHub Actions validate `develop` before `main`?

**Not directly.** `.github/workflows/ci.yml` triggers only on:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

It has **no `workflow_dispatch`** and **no `develop` trigger**. A push to `develop` runs **no
`ci.yml` validation**. `gh run list --workflow=ci.yml` confirms `ci.yml` has **never run for
`8b7648e` or any `develop` commit**. There is currently **no `develop → main` PR** open.

### Safest validation path — recommended

| Option                           | Assessment                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Open PR `develop → main`**     | ✅ **RECOMMENDED.** Triggers `ci.yml` via `pull_request: [main]`; runs every job (ts/go/rust/python/proto/terraform/k8s) on `ubuntu-24.04` against the develop code. Opening a PR is **not** a merge — it is a pure validation gate; `main` is untouched until someone explicitly merges. Requires **no workflow change**. |
| Temporary `workflow_dispatch`    | Requires editing+committing `ci.yml` to add the trigger; manual run. Workable but a config change.                                                                                                                                                                                                                         |
| Temporary `develop` push trigger | Requires editing+committing `ci.yml`; "temporary" triggers tend to persist. Reasonable as a _permanent_ CI-hardening improvement, but heavier than the PR for this one validation.                                                                                                                                         |

→ **Open a `develop → main` pull request.** It is the safest, change-free way to get a full
Ubuntu CI run for `develop`'s code before any merge to `main`.

### Rust job

- **Runner:** `ci.yml` `rust` job has `runs-on: ubuntu-24.04` — ✅ confirmed.
- **Steps:** `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`,
  `cargo test --workspace --no-fail-fast`.
- **Gating:** `if: needs.changes.outputs.rust == 'true'`. A `develop → main` PR diff includes Rust
  changes (`Cargo.toml`, `rust-toolchain.toml`, `packages/rust/**`), so the `changes` filter will
  yield `rust: true` and the job **will run** on that PR.
- **`cargo test --workspace` in CI:** ❌ **UNCONFIRMED** — no CI run has executed the `rust` job
  for `develop`'s code. Local `cargo test` fails only on a Windows host limitation (vendored
  `openssl-sys` needs Perl `Locale::Maketext::Simple`) — not a code defect, not representative of
  Ubuntu. Confirmable **only** by the `develop → main` PR's `ci.yml` run.

### Local verification results — `develop` @ `8b7648e`

`8b7648e` = `b70f50a` (Phase 12 integration HEAD) **+ 1 commit** (`fix(api-gateway): restore go
verification`). Provenance of the green results:

| Gate                                          | Result                                                     | Source                                           |
| --------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `pnpm install --frozen-lockfile`              | ✅ pass                                                    | Phase 12 §1 (`b70f50a`) — unchanged by `8b7648e` |
| `pnpm turbo run lint`                         | ✅ pass (85/85)                                            | Phase 12 §1 — unchanged                          |
| `pnpm turbo run typecheck`                    | ✅ pass (86/86)                                            | Phase 12 §1 — unchanged                          |
| `pnpm turbo run test`                         | ✅ pass (62/62)                                            | Phase 12 §1 — unchanged                          |
| `pnpm turbo run build`                        | ✅ pass (11/11)                                            | Phase 12 §1 — unchanged                          |
| `buf lint`                                    | ✅ pass                                                    | Phase 12 §1 — unchanged                          |
| `task codegen` (proto + graphql + **gqlgen**) | ✅ pass                                                    | re-verified on `8b7648e`                         |
| `node scripts/go-work-run.mjs test ./...`     | ✅ pass (exit 0) — **api-gateway now tested**, not skipped | re-verified on `8b7648e`                         |
| `go test ./...` in `services/api-gateway`     | ✅ pass (exit 0)                                           | re-verified on `8b7648e`                         |
| `buf breaking --against origin/main`          | ⚠️ accepted — one detection, ADR 0042                      | Phase 12 §5                                      |
| `cargo test --workspace`                      | ⚠️ Windows host limitation; **Ubuntu CI unconfirmed**      | NB-2 / B-1                                       |

### api-gateway blocker (B-3) resolution

✅ **RESOLVED & on `develop`.** Codex `8b7648e` added `internal/gql/resolver/helpers.go`, repaired
the mangled `Me` doc comment in `schema.resolvers.go`, wired `codegen:gqlgen` into `Taskfile.yml`
(`codegen` + `test:go` deps), and removed the silent-skip branch from `go-work-run.mjs`.
Independently re-verified (all 4 review criteria PASS — see the previous section). `develop` no
longer contains a broken api-gateway.

### Rust CI status

❌ **UNCONFIRMED.** No `ci.yml` run has exercised the `rust` job for `develop`. It must be
confirmed on Ubuntu via the `develop → main` PR.

### FINAL VERDICT: 🟡 MAIN READY AFTER CI PR

`develop` @ `8b7648e` is **locally green** and **carries no known code blockers** — the api-gateway
build failure is fixed and verified; all local + integrated gates pass. The **only** remaining
gate is **CI confirmation on Ubuntu**, which the current `main`-only `ci.yml` cannot provide for a
`develop` push.

**`develop` is ready to promote to `main` contingent on:**

1. Open a `develop → main` pull request (no code change; not a merge).
2. `ci.yml` runs all jobs on `ubuntu-24.04`; the **`rust` job** (`cargo fmt`/`clippy`/`test`) and
   all other jobs must be **green**.
3. If green → **MAIN READY**, merge the PR. If the `rust` job (or any job) fails → **NOT MAIN
   READY**, fix and re-run.

CI-hardening follow-up (non-blocking): add a `develop` trigger and/or `workflow_dispatch` to
`ci.yml` so future `develop` commits are validated without needing a PR.

_Final check: no code modified; no merge to `main`; `develop` not updated; no force-push._

---

## Phase 13 CI Unblock Policy — 2026-05-21

### Tool setup

`.mise.toml` now installs Task through the Aqua registry key `aqua:go-task/task`. The previous
`go-task` key is not present in the mise registry and caused CI setup to fail before repository
verification could run.

The same CI run also proved the existing Aqua package IDs for Buf and protoc were invalid in mise's
Aqua registry. `.mise.toml` now uses `aqua:bufbuild/buf` and
`aqua:protocolbuffers/protobuf/protoc`. Python GitHub artifact attestation is disabled through
`python.github_attestations = false`, matching mise's documented remediation for the pinned
Python 3.12.7 build that currently has no GitHub artifact attestation.

### Buf breaking policy

CI still runs `buf lint`, `buf generate`, and generated Go drift checks. For pull requests into
`main`, breaking checks now run module-by-module for proto modules that exist in both the PR and
the `main` baseline. This preserves breaking checks for existing contracts while avoiding the Buf
workspace image-count failure when `develop` adds new proto modules before `main` has those modules.

New proto modules are not exempt from governance: they are linted and generated in the PR, and their
breaking-change baseline starts after the module lands on `main`. Removing a baseline module fails
the CI script.

The only accepted breaking output while comparing Phase 13 `develop` to the older `main` baseline is
the ADR 0042 `go_package` correction for
`packages/events/schemas/auth/v1/user_registered.proto`. Any other `buf breaking` output fails CI.

---

## Phase 13 CI Toolchain Alignment — 2026-05-21

PR #3 validation reached repository checks after the proto and Terraform unblock, then failed on
toolchain mismatches rather than product behavior:

- TypeScript CI used Node `22.10.0`, while the locked dependency graph contains
  `eslint-visitor-keys@5.0.1`, which requires `^20.19.0 || ^22.13.0 || >=24`. Runtime pins now use
  Node `22.13.0` in `.mise.toml` and `.nvmrc`, and the root package engine is aligned to
  `>=22.13.0`.
- Go CI used `golangci-lint` `v1.61.0`, whose binary was built with Go 1.23 and cannot lint a repo
  targeting Go 1.25. CI now installs `golangci-lint` `v2.12.2` with the repo Go toolchain and runs
  it through the module-aware `scripts/go-work-run.mjs lint` path, matching the Go workspace shape
  instead of using invalid root-level `./services/...` patterns.
- Rust CI relies on `rustfmt` and `clippy`; the Rust job now installs those components explicitly
  before running `cargo fmt`, `cargo clippy`, and `cargo test`. `rust-toolchain.toml` already
  declares the same required components. Once `rustfmt` was available locally, `cargo fmt --check`
  exposed one existing formatting diff in `packages/rust/telemetry/src/lib.rs`; that file was
  reformatted with `cargo fmt` only.
- Python CI used `uv sync --all-packages`, but the pinned uv `0.4.27` does not support that flag.
  The uv pin is now `0.11.15`, preserving the existing all-workspace Python verification command
  instead of weakening Python checks.

No verification job was disabled or skipped.

PR #3 follow-up from CI run `26245088514`:

- Go lint installed `golangci-lint` successfully, but the next Actions step looked for the binary
  at `$(go env GOPATH)/bin/golangci-lint`, which was not stable under `mise`. CI now installs the
  binary into `$RUNNER_TEMP/go-bin` and exports the exact path through `$GITHUB_ENV` before invoking
  the module-aware runner.
- Rust reached `cargo clippy`, confirming the component install fixed the previous rustfmt issue.
  The next native build failure was `rdkafka-sys` missing `curl/curl.h`; the Rust job now installs
  Linux native build prerequisites (`libcurl4-openssl-dev`, `libsasl2-dev`, `pkg-config`, `cmake`,
  and `perl`) before running fmt, clippy, and test.
- Python `uv sync`, `ruff`, and `mypy` passed on Ubuntu with `uv 0.11.15`. `pytest` then exited 5
  because no Python tests were collected under `ai/` or `packages/python/`. CI still runs pytest, but
  treats exit 5 as the documented empty-test status until Python tests exist; all real pytest
  failures still fail the job.
- The TypeScript job passed `pnpm install --frozen-lockfile` and
  `pnpm turbo run lint typecheck test build`, then hung while uploading `**/coverage/**`. The
  coverage artifact path is now scoped to `apps/**/coverage/**` and `packages/**/coverage/**`, with
  generated and dependency folders excluded. The upload step now runs only when matching coverage
  files exist, so missing coverage artifacts cannot hang or fail a successful verification run.

Local Windows Rust verification caveat:

- `cargo fmt --all -- --check` passes.
- `cargo clippy --workspace --all-targets -- -D warnings` and
  `cargo test --workspace --no-fail-fast` both stop before checking project code because vendored
  OpenSSL cannot find `perl` on this Windows host. CMake is available locally, but Strawberry Perl
  installation through `winget` did not complete within the local timeout. The CI Rust job runs on
  Ubuntu, keeps `cargo fmt`, `cargo clippy`, and `cargo test` enabled, and now explicitly installs
  the required Rust components.

Local Windows Python verification caveat:

- `uv --version` reports `0.11.15`, confirming the pinned version supports
  `uv sync --all-packages`.
- `uv sync --all-packages --dry-run` resolves the workspace but cannot install
  `tokenspeed-mla==0.1.2` on Windows because that package publishes Linux wheels only. The CI Python
  job runs on Ubuntu, so this local platform limitation does not require weakening Python
  verification.
