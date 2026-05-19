# 0019. Schema-first contracts via Protobuf + Buf

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/platform @next-ecosystem/architecture
- **Tags**: api, events, dx

## Context

Service contracts and event schemas are load-bearing. A regression in either is a multi-team incident. We need:

- Strongly typed contracts in every language we ship.
- Mechanical breaking-change detection.
- A single registry of truth that humans and CI can both query.
- Validation primitives (required, ranges, formats) defined alongside the schema.

## Decision

- All contracts (gRPC + Kafka event schemas) are declared in **Protobuf**.
- **Buf** is the toolchain: `buf lint`, `buf breaking`, `buf generate`, `buf push` to a private Buf module.
- **protovalidate** decorates message fields with constraints; validation runs in every language.
- Clients generated to `gen/{go,ts,python}`; consumed via `packages/api-client`.

## Alternatives considered

- **OpenAPI / JSON Schema for events** — viable; codegen story is weaker for streaming + binary efficiency.
- **Avro for events, Proto for RPC** — mixing two schema systems doubles tooling and erodes the registry's single-source benefit.
- **GraphQL as the universal schema** — already used at the external plane; not the right tool for internal RPC and event payloads.

## Consequences

### Positive
- One schema describes the wire format, the validation, and the codegen for every language.
- `buf breaking` blocks accidental wire breaks at PR time.
- Schema registry-backed Kafka avoids "what fields does this message have today" archaeology.

### Negative
- One toolchain learning curve.
- Schema migration windows (additive change, dual-publish, deprecate) require discipline.

## Implementation notes

- Module: `buf.build/next-ecosystem/proto`.
- CI: `buf lint`, `buf format --diff`, `buf breaking --against '.git#branch=main'` on every PR.
- Generated code is gitignored; regenerated via `task codegen` and verified in CI.
- Event schemas live alongside service code under `services/<svc>/proto/events/` and are reflected into the cross-service `proto/events/` for consumers.
