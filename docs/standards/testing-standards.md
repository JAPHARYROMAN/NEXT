# Testing Standards

> The enforceable standard for what NEXT tests, how, and what blocks a merge.
> Driven directly by the Phase 10 audit finding that test coverage was the
> platform's top quality gap (SM-1).

Status: **binding**.

## 0. Principle

Tests exist to make change _safe_ — to let a platform built fast by many agents
evolve without fear. Coverage is not a vanity number; it is the bar below which
a change cannot be trusted. The Phase 10 audit found near-zero coverage; these
standards are the correction.

## 1. The test pyramid

| Level                  | Tests                                                  | Scope                                                                          |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Unit**               | domain logic, pure functions, components               | fast, no I/O, no network                                                       |
| **Integration**        | a service against a real datastore / a real dependency | per service                                                                    |
| **Contract**           | proto / event-schema / API contracts                   | cross-service                                                                  |
| **End-to-end**         | a user-facing flow across services                     | sparing, golden-path                                                           |
| **Resilience / chaos** | failure injection                                      | see [docs/resilience/chaos-engineering.md](../resilience/chaos-engineering.md) |

Most tests are unit tests; integration tests cover the datastore boundary; e2e
is reserved for golden paths.

## 2. Coverage doctrine

- **Go `domain` packages** — domain logic carries **unit tests**. `domain` is
  pure ([go-service-standards.md](go-service-standards.md)) precisely so it is
  fully unit-testable; untested domain logic is a review blocker.
- **Stores** — each service has at least one **integration test** against a real
  datastore.
- **Security-critical paths** — auth, JWT, authorization, payments, entitlements
  **MUST** have tests. This is non-negotiable (Phase 10 finding SM-1/SO-8).
- **Frontend** — components have unit tests; key flows have integration tests;
  accessibility is tested (§5).
- Coverage is judged by _meaningful behavior covered_, not a raw percentage —
  but a service with no tests does not ship.

## 3. The production-promotion gate

A service may not be promoted past `functional` to **production-ready** until
([docs/governance/technical-debt-governance.md](../governance/technical-debt-governance.md)):

- domain-logic unit tests exist;
- at least one store integration test exists;
- security-critical paths are tested;
- it has been load-tested and chaos-tested (§4).

## 4. Resilience & chaos testing

- A production-candidate service is exercised by the relevant chaos experiments
  ([docs/resilience/chaos-engineering.md](../resilience/chaos-engineering.md)):
  dependency-latency, pod kill, datastore failover.
- Resilience behavior is tested — circuit breakers trip, fallbacks engage,
  degradation chains terminate coherently
  ([docs/resilience/graceful-degradation.md](../resilience/graceful-degradation.md)).
- A failure mode is not "covered" until its chaos experiment is green.

## 5. Frontend & accessibility testing

- Components: unit tests for behavior; visual/interaction tests for key
  components.
- **Accessibility is tested** — automated a11y checks (roles, contrast,
  keyboard) in CI, plus manual screen-reader checks for new interactive
  surfaces ([frontend-standards.md](frontend-standards.md) §6).
- Performance budgets per surface are checked; a regression is a review concern.

## 6. What blocks a merge

A PR is blocked if:

- it changes `domain` logic with no accompanying unit test;
- it changes a security-critical path with no test;
- it regresses an existing test (a red suite);
- it adds a flaky test (§8);
- it ships a production-candidate service missing the §3 gate.

## 7. Test ownership

- Tests are owned by the **same agent/team that owns the code**
  ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) — a domain owner owns
  their domain's tests.
- Copilot may accelerate writing tests for _specified_ behavior, under the
  owning agent's direction ([multi-agent-consistency.md](multi-agent-consistency.md)).

## 8. Flaky-test policy

- A flaky test is a **defect**, not a nuisance — it erodes trust in the whole
  suite.
- A test that flakes is **quarantined immediately** (so it stops blocking
  unrelated work) and **fixed or deleted within a bounded window** — quarantine
  is not a parking lot. A test quarantined and ignored is itself tracked debt.
- Disabling a test to make CI green is **never** an acceptable fix for a real
  failure — fix the cause.

## 9. Prohibited patterns

- ✗ Shipping `domain` logic or a security-critical path with no test.
- ✗ Disabling or deleting a test to bypass a real failure.
- ✗ A new flaky test left in the suite.
- ✗ Mocking a datastore in a test that is meant to verify datastore behavior —
  integration tests hit a real datastore.
- ✗ Promoting a service to production-ready without the §3 gate.
- ✗ Treating a coverage percentage as the goal instead of meaningful behavior.

## Related

- [go-service-standards.md](go-service-standards.md) · [docs/resilience/chaos-engineering.md](../resilience/chaos-engineering.md) · [docs/governance/code-review-doctrine.md](../governance/code-review-doctrine.md) · [docs/audits/service-maturity-matrix.md](../audits/service-maturity-matrix.md)
