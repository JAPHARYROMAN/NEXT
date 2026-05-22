# 0040. Generated Go code tracking policy (`gen/go`)

- **Status**: Accepted
- **Date**: 2026-05-20
- **Owners**: Architecture · Backend · Infrastructure
- **Tags**: codegen, proto, go, governance, ci

## Context

Protobuf contracts under `services/*/proto/<domain>/v<N>/*.proto` are compiled by
`buf generate` into Go bindings under `gen/go/<domain>/v<N>/*.pb.go`. `go.work`
lists `./gen/go` as a workspace module, so every Go build resolves that module.

Phases 9–11 surfaced a defect: the root `.gitignore` rule `**/gen/` excluded the
whole `gen/` tree, while the intended exceptions `!gen/go/go.mod` /
`!gen/go/go.sum` were **ineffective** — Git cannot re-include a file whose
parent directory is excluded. Result: `git ls-files gen/` returned nothing, the
`gen/go` module was entirely untracked, and a fresh clone could not resolve the
Go workspace at all (`go.work` referenced a directory with no `go.mod`).

Phase 11 produced a candidate fix in `.gitignore` (un-ignore the `gen/` and
`gen/go/` directories, then re-ignore `gen/go/**`, then re-include the two
module files) plus `docs/git/generated-code-policy.md`. This ADR ratifies the
official decision so the policy is authoritative rather than provisional.

Two options were on the table:

- **Option A** — track only `gen/go/go.mod` and `gen/go/go.sum`; ignore all
  generated `*.pb.go`.
- **Option B** — track nothing under `gen/go`; require `buf generate` before any
  Go verification.

## Decision

**Adopt Option A.** The repository tracks exactly two files under `gen/go`:

```
gen/go/go.mod      — tracked (Go workspace boundary)
gen/go/go.sum      — tracked (Go workspace boundary)
gen/go/**/*.pb.go  — NOT tracked (generated; produced by `buf generate`)
```

All other generated output (`gen/go/**`, `services/*/gen/**`, `*.pb.ts`,
`*_pb2.py`) remains untracked.

Because tracking the module files makes the workspace *resolvable* but not
*buildable* (the `.pb.go` files are still absent on a fresh clone), Option A is
adopted **together with** Option B's discipline: **`buf generate` (or
`task codegen`) is mandatory before any Go build, test, or lint — locally and in
CI.** CI must run codegen as a step before the Go job; CI must not depend on
committed generated files.

The canonical `.gitignore` block is:

```
**/gen/
!gen/
!gen/go/
gen/go/**
!gen/go/go.mod
!gen/go/go.sum
```

## Rationale

Option A keeps `go.work` honest: with `gen/go/go.mod` tracked, the workspace
*resolves* on a fresh clone, `gopls` and `go work sync` behave, and the failure
mode of a missing codegen step is a clear "missing `.pb.go`" build error rather
than an opaque "module not found in workspace" error before any build even
starts. Option B leaves `go.work` pointing at a directory with no `go.mod` — a
workspace error that breaks even read-only tooling.

Generated `.pb.go` files stay out of Git: they would bloat diffs, invite merge
conflicts, and tempt contributors to "commit `gen/` to make CI pass" — which
hides the real failure (a stale hand-written source file). The mandatory
`buf generate` step gives Option B's guarantee (generation is never skipped)
without Option B's workspace-resolution cost.

Option A also ratifies work already completed in Phase 11 (the `.gitignore`
fix), rather than forcing a rollback to Option B.

## Alternatives considered

- **Option B — track nothing under `gen/go`** — simplest ignore rule, but
  `go.work`'s `./gen/go` member then has no `go.mod`, so the workspace fails to
  resolve for *every* Go command on a fresh clone, not just builds. Rejected:
  strictly worse developer and tooling experience than Option A for no
  additional safety, since Option A already mandates generation before build.
- **Track all generated `.pb.go`** — no codegen step needed to build, but
  produces large, conflict-prone diffs and lets stale generated code mask stale
  proto sources. Rejected: violates the "generated code is not source" principle
  and `docs/git/generated-code-policy.md`.

## Consequences

### Positive

- `go.work` resolves on a fresh clone; Go tooling is not broken pre-codegen.
- Generated `.pb.go` never pollute diffs or cause merge conflicts.
- The real failure mode (stale `.proto`) is never hidden by committed output.

### Negative

- A fresh clone cannot `go build` until `buf generate` runs — every Go workflow
  and CI must run codegen first.

### Neutral / open questions

- `gen/go/go.mod` and `gen/go/go.sum` change rarely; when proto packages are
  added/removed they must be committed in the same change as the `.proto` edit.

## Implementation rules

- `.gitignore` contains exactly the six-line block above; no other `gen/`
  exceptions without a superseding ADR.
- `git ls-files | grep -E '(^|/)gen/' | grep -vE '^gen/go/go\.(mod|sum)$'`
  produces **no output** on a clean repo.
- `gen/go/go.mod` and `gen/go/go.sum` are tracked and kept current with the
  proto package set.
- CI runs `buf generate` (or `task codegen`) **before** the Go build/test/lint
  job; CI never relies on committed generated files and fails if generation
  changes a tracked source-of-truth file.
- Local Go verification runs codegen first (documented in
  `docs/git/pre-push-checklist.md` §4).

## Agent instructions

- **Claude** — Owns this policy and the `.gitignore` block. Ensures `go.work`
  and the codegen step stay coherent; reviews any proposed `gen/` exception.
- **Codex** — Commits `gen/go/go.mod` / `gen/go/go.sum` and keeps them current;
  wires the `buf generate` step into CI before the Go job; never commits
  `.pb.go`.
- **Composer** — No action unless TS bindings (`gen/ts`) are later consumed;
  same policy applies by analogy.
- **Copilot** — Never stages files under `gen/` except the two module files;
  the hygiene pre-commit check flags violations.

## Review triggers

- TypeScript or Python bindings begin to be consumed (extend the policy to
  `gen/ts` / `gen/python`).
- `buf` is replaced, or the Go workspace stops using a separate `gen/go` module.
- Codegen time becomes large enough that caching committed output is
  reconsidered.

## Related documents

- [0038. Canonical Go service layout](0038-canonical-go-service-layout.md)
- [0039. Event schema source of truth](0039-event-schema-source-of-truth.md)
- `docs/git/generated-code-policy.md` — operational companion (hygiene domain)
- `PHASE_11_EXIT_AUDIT_CLAUDE.md` — Gate 5, which this ADR resolves
