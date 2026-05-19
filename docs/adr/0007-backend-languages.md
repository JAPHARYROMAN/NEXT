# 0007. Backend languages: Go primary, Rust for perf-critical paths

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform
- **Tags**: languages, services

## Context

We must pick a default backend language that the majority of services will be written in, plus a sharp tool for performance-critical paths (media transcoding, live ingest, recommendation ranking hot path, vector indexing accelerators).

## Decision

- **Go 1.23+** is the default for backend services. Standard library + a small set of vetted dependencies (`grpc-go`, `pgx`, `kafka-go`, `redis/v9`, `chi`, `samber/oops`).
- **Rust** is the language for performance-critical paths: media transcoder, live ingest path, recommendation ranker hot path, vector indexer.
- **Python** is for AI / ML systems only (see [ADR 0016](0016-ai-serving.md)).
- **Node / TypeScript** for client-side code, codegen tools, and the GraphQL gateway.

## Alternatives considered

- **Java / Kotlin** — capable but heavy, slow cold-start, and a JVM operational footprint our team doesn't want to maintain.
- **C# / .NET** — fine language; lacks the ecosystem depth in our domains and the team experience.
- **All-Rust** — beautiful in theory; in practice Rust's compile times and the cognitive overhead of borrow-checking complicate iteration on services where 80 % of the work is plumbing.
- **All-Go** — gives up real performance wins on the codec, ranker, and ingest paths.

## Consequences

### Positive
- Go's hiring pool, ecosystem (`grpc-go`, observability libraries), and operational profile (single static binary, fast startup) are excellent for the bulk of services.
- Rust gives us safety + speed where it matters; the FFI boundary stays narrow.
- Two languages on the backend is a manageable cognitive load.

### Negative
- We sometimes need a thin Go layer in front of a Rust core (e.g. media-service control plane in Go, transcoder in Rust). This is a deliberate seam.
- Cross-language tooling (codegen, telemetry, logging) must be kept symmetric — see `packages/go/*`, `packages/rust/*`.

## Implementation notes

- Go workspace at `go.work`. Rust workspace at `Cargo.toml`. Both are visible to the monorepo tooling.
- Shared libraries: `packages/go/{telemetry,eventbus,auth,database}` and `packages/rust/{telemetry,eventbus,proto}` ensure parity.
- A new service defaults to Go. Choosing Rust requires a short note in the service README explaining the latency / throughput / safety target that justifies it.
