# 0020. Polyglot toolchain managed by mise

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform
- **Tags**: dx, tooling

## Context

NEXT spans Node, Go, Rust, Python, Terraform, kubectl, Helm, ArgoCD, buf, protoc, and more. We need pinned versions per repo, frictionless install on a new machine, and CI parity with local dev.

## Decision

**mise** is the toolchain manager. `.mise.toml` is the single source of truth for tool versions. `mise install` reproduces the exact toolchain anywhere.

## Alternatives considered

- **asdf** — mise is asdf-compatible and faster; we inherit asdf's plugin ecosystem without its perf overhead.
- **nix / devenv** — beautiful determinism; the learning curve for the team and the operational mass on dev machines isn't justified yet.
- **Docker dev containers** — useful in addition (we ship one), but a poor fit as the *only* dev environment for performance and IDE integration reasons.

## Consequences

### Positive
- One file pins every tool. New hire onboarding: `curl mise.run | sh && mise install`.
- CI uses the same `.mise.toml`; no drift between local and CI.
- Plugin ecosystem covers the long tail (`aqua:buf-build/buf`, `aqua:protocolbuffers/protobuf`).

### Negative
- One more tool to learn (low marginal cost; familiar to asdf users).

## Implementation notes

- `.mise.toml` lives at the repo root. Per-app overrides allowed via `apps/*/.mise.toml`.
- CI bootstrap: `uses: jdx/mise-action@v2`.
- Dev container also runs `mise install` on first attach.
