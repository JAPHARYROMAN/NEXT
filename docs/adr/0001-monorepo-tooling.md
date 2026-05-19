# 0001. Monorepo with Turborepo + pnpm

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/architecture
- **Tags**: repo, tooling, dx

## Context

NEXT spans six frontend apps, fifteen backend services, eight AI systems, eleven shared packages, and a large infrastructure surface — across TypeScript, Go, Rust, and Python. We need a single source of truth that engineers, build systems, AI agents, and tooling can navigate.

Constraints:

- Cross-language refactors must remain atomic.
- Build graph awareness is required to keep CI cost sane at this scale.
- Generated client SDKs (proto / GraphQL) must propagate to consumers without version juggling.
- Open-source contributions to single services should not require cloning the whole repo, but the repo must still be the canonical home.

## Decision

We adopt a **single polyglot monorepo** at `next-ecosystem/next` with:

- **Turborepo** as the JS/TS task orchestrator and build graph cache.
- **pnpm 9** as the JS package manager with workspaces + `catalog:` dependency pinning.
- **Go workspaces** (`go.work`) for Go modules.
- **Cargo workspace** for Rust crates.
- **uv workspace** for Python packages.
- **mise** for cross-language toolchain version pinning.
- **go-task** (`Taskfile.yml`) as the cross-language meta-runner that ties Turbo, cargo, go, and uv together.

## Alternatives considered

- **Nx** — more opinionated and powerful task graph, but its plugin ecosystem and DX are heavily JS/TS centric. Turbo's lean model and remote caching with signed artifacts fit a polyglot repo better.
- **Bazel** — best-in-class for very large polyglot monorepos, but operational complexity is enormous and is justified by repos with >100M lines or strict hermetic requirements we do not have yet. Reserved for a future ADR if we cross that threshold.
- **Multi-repo with a meta-tool** (`vfox`, `repo`, etc.) — rejected: defeats atomic refactors and forces version coordination, which is exactly what NEXT must avoid at this stage.

## Consequences

### Positive
- One PR can refactor across web, mobile, and three services atomically.
- Generated clients (`proto/`) propagate via workspace links; no publish step between services.
- Remote cache reduces CI wall time dramatically for unchanged subgraphs.
- Single CODEOWNERS file enforces domain ownership across the entire ecosystem.

### Negative
- Repo size grows large; shallow clone is the default in CI.
- Engineers must learn five package managers (pnpm, cargo, go modules, uv, plus mise).
- Turbo's cache key sensitivity occasionally needs tuning when codegen outputs drift.

### Neutral
- We are not committing to monorepo forever; if a domain genuinely diverges in lifecycle, splitting it remains possible.

## Implementation notes

- Cross-language tasks are orchestrated via `Taskfile.yml`. Turbo runs JS/TS; Task runs the others.
- Remote cache lives in S3 with signed artifacts (`remoteCache.signature: true` in `turbo.json`).
- All version pins flow through `.mise.toml` and `pnpm-workspace.yaml`'s `catalog:`.
