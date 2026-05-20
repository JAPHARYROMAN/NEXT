# NEXT Platform Standards

The architectural immune system of NEXT — the binding, enforceable standards
that keep the platform coherent, consistent, and elegant as it grows massive and
is built by many agents and teams in parallel.

> NEXT must remain elegant even as it becomes massive.

## Status

Every document here is **binding**. A standard is not a style suggestion — it is
a rule a reviewer or a CI check can hold any change against and get a yes/no
answer. Standards **operationalize** decisions already made in the ADRs and
governance docs; they do not re-decide them. Where a standard could appear to
differ from an ADR, the ADR governs.

## Documents

| Doc                                                        | Standardizes                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [go-service-standards.md](go-service-standards.md)         | every `/services` Go service — layout, boundaries, proto, migrations, resilience      |
| [frontend-standards.md](frontend-standards.md)             | `/apps` + frontend packages — components, the package taxonomy, motion, a11y, state   |
| [ai-system-standards.md](ai-system-standards.md)           | `/ai` — Python-first, inference boundaries, model registry, embeddings                |
| [event-standards.md](event-standards.md)                   | the event bus — envelope, category streams, versioning, idempotency, DLQ              |
| [observability-standards.md](observability-standards.md)   | the mandatory telemetry floor — traces, metrics, logs, health, alerting               |
| [api-standards.md](api-standards.md)                       | gRPC + GraphQL — conventions, versioning, validation, errors, pagination              |
| [database-standards.md](database-standards.md)             | Postgres, Redis, ClickHouse, Qdrant — migrations, keys, lifecycle                     |
| [infrastructure-standards.md](infrastructure-standards.md) | Terraform, Kubernetes, secrets, environments, namespaces                              |
| [testing-standards.md](testing-standards.md)               | the test pyramid, coverage doctrine, the production-promotion gate, flaky-test policy |
| [security-standards.md](security-standards.md)             | secure defaults, auth, secrets, validation, redaction, audit                          |
| [naming-conventions.md](naming-conventions.md)             | one naming grammar — services, packages, events, proto, env vars, metrics, flags      |
| [monorepo-governance.md](monorepo-governance.md)           | dependency direction, forbidden cross-imports, runtime separation, shared packages    |
| [multi-agent-consistency.md](multi-agent-consistency.md)   | rules keeping four agents producing one coherent codebase                             |
| [enforcement-mechanisms.md](enforcement-mechanisms.md)     | how every standard is enforced — CI, review, ADR gates, CODEOWNERS                    |

## The standards system in one paragraph

NEXT's standards are the concrete, enforceable layer below the ADRs and the
governance docs. Every Go service follows one canonical layout with a pure
`domain` core; every frontend surface composes one design system through one
package taxonomy; every AI subsystem is Python-first, observable, and never on a
critical path; every event is a versioned, idempotent, proto-defined message on
a category stream; every production service emits the mandatory observability
floor; APIs, databases, and infrastructure each have a binding convention set;
naming follows one grammar across the whole monorepo so duplication is
_detectable_; the monorepo's dependency direction never reverses; all four
agents build to the _same_ standards; and every standard is enforced by a CI
gate, a review gate, an ADR requirement, or a CODEOWNERS route — a standard with
no enforcement is rewritten until it has one, or it is cut.

## How to use this directory

- **Building something?** Read the standard for what you are building before you
  start; it tells you the layout, the conventions, and the prohibited patterns.
- **Reviewing a PR?** [enforcement-mechanisms.md](enforcement-mechanisms.md) is
  the merge-blocker checklist; the relevant domain standard is the detail.
- **Adding a standard?** It must be enforceable (CI / review / ADR / CODEOWNERS)
  and it must not contradict an ADR. Standards are revised like code.

## Grounding

These standards consolidate and operationalize: the ADR system (especially
[0033](../adr/0033-multi-agent-governance.md), [0034](../adr/0034-monorepo-boundary-ownership.md),
[0036](../adr/0036-event-topology.md)–[0039](../adr/0039-event-schema-source-of-truth.md));
the [governance operating system](../governance/README.md); the
[resilience](../resilience/README.md) and observability doctrine; and the
findings of the [Phase 10 coherence audit](../audits/phase-10-system-integration-audit.md)
— whose top finding, near-zero test coverage, is answered by
[testing-standards.md](testing-standards.md).

## Scope

Standards and enforcement architecture only — no services, apps, or
infrastructure were created or modified. The standards are a **living system**:
revised like code, flagged for process theater and cut where they do not earn
their cost, and reviewed each integration phase.
