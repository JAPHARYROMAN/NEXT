# Code Review Doctrine

> What review is for at NEXT, what every PR must clear, and what blocks a merge.
> Review is the gate where coherence, quality, and safety are actually enforced
> — and it is designed assuming the author may be wrong.

## 0. Principle

Review exists to catch what the author — human or AI — cannot see about their
own work: a boundary crossed, a contract broken, a gate skipped, a coherence
drift. It is **not** a style argument and **not** a ceremony. A review that adds
friction without catching one of those is process theater
([EOS](engineering-operating-system.md) §7).

## 1. Every PR carries the governance checklist

Every pull request uses [`.github/pull_request_template.md`](../../.github/pull_request_template.md).
Its checklist is not decoration — each box is a real gate:

- **ADR impact** — no architectural change without a linked ADR; no accepted-ADR
  violation.
- **Ownership boundary** — all files in the author's domain, or a linked
  cross-domain assignment; no blanket `git add -A`.
- **Service runtime** — no runtime crossed ([runtime-governance.md](runtime-governance.md)).
- **Event-contract impact** — schema changes versioned, consumers + docs updated.
- **Database/migration impact** — migrations included, reversible, concurrency-safe.
- **Observability** — new code paths emit OTel traces/metrics/logs.
- **Security** — no secrets, inputs validated at trust boundaries, auth reviewed.
- **Test evidence** — build/test output or described verification.
- **Rollback plan** — how the change is reverted.

A PR with unaddressed boxes is **not ready for review**.

## 2. Required reviewers

Reviewer requirements scale with blast radius
([EOS](engineering-operating-system.md) §2):

| Change                                                 | Required reviewer(s)                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| In-domain, non-architectural                           | the domain owner ([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) via `CODEOWNERS` |
| Architectural change                                   | + Claude (architecture) — see [architecture-governance.md](architecture-governance.md) §4  |
| Cross-domain change                                    | + the second domain owner; a linked assignment                                             |
| Runtime / security / auth change                       | + human maintainer                                                                         |
| Shared-interface package (`events`, `types`, `config`) | + Claude; interface-first protocol applied                                                 |

`CODEOWNERS` mechanically routes the domain reviewer; the rest is enforced by the
checklist and by review judgment.

## 3. Automated gates (CI)

CI runs on every PR; a red gate blocks merge. The mandatory gates:

- **Build** — every affected module/app/service compiles.
- **Lint / format** — the repo's lint + format standards pass.
- **Tests** — the test suites for affected code pass
  ([quality minimums](#6-quality-minimums)).
- **Type checks** — Go vet, TS typecheck, as applicable.
- **Schema checks** — Buf breaking-change detection on proto changes
  ([ADR 0019](../adr/0019-schema-first.md), [0039](../adr/0039-event-schema-source-of-truth.md)).
- **Security scan** — secret scanning, dependency vulnerability scan.

Automated gates catch the mechanical; human review catches the architectural and
the contextual. Neither replaces the other.

## 4. The four review lenses

Beyond "is the code correct", a reviewer applies four lenses sized to the change:

1. **Architecture** — does it respect ADRs, boundaries, runtimes, the service
   layout ([ADR 0038](../adr/0038-canonical-go-service-layout.md))? does it need
   an ADR it does not have?
2. **Security** — inputs validated at trust boundaries, no secrets, auth intact,
   no new public surface left unguarded.
3. **Observability** — new code paths instrumented with OTel; health endpoints
   intact ([ADR 0009](../adr/0009-observability.md)).
4. **Resilience** — failure paths handled; timeouts and circuit breakers on new
   dependency calls; degradation behavior considered
   ([docs/resilience/graceful-degradation.md](../resilience/graceful-degradation.md)).

For a small in-domain change, lenses 2–4 are a quick scan. For a service or a
boundary change, they are explicit and may pull in a specialist reviewer.

## 5. Merge blockers

A PR **does not merge** while any of these holds (consolidated from
[architecture-governance.md](architecture-governance.md) §5):

- a red automated gate (§3);
- an unaddressed governance-checklist box (§1);
- a missing required reviewer approval (§2);
- an architectural change with no linked ADR;
- an accepted-ADR violation;
- a runtime or domain boundary crossed without approval/assignment;
- an event-contract change without versioning + consumer/doc updates;
- no rollback plan for a non-trivial change.

## 6. Quality minimums

A PR must meet, or it does not merge:

- **Tests** — the change is covered; for a service moving toward production, the
  test bar is domain-logic unit tests + a store integration test
  (Phase 10 finding SM-1, [technical-debt-governance.md](technical-debt-governance.md)).
  Security-critical paths (auth, JWT, authz) require tests, not just a promise.
- **Observability** — no new production code path ships without instrumentation.
- **Resilience** — new cross-service / cross-region calls have timeouts and a
  fallback.
- **Performance budgets** — a change on a hot path must not regress the
  service's stated SLO ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md));
  a regression is a blocker or a documented, accepted tradeoff.
- **No new untracked debt** — debt the change knowingly incurs is recorded
  ([technical-debt-governance.md](technical-debt-governance.md)).

## 7. Review and AI authorship

Most NEXT code is written by AI agents. Review adapts:

- review **assumes the author may be confidently wrong** — claims of "this
  function exists / this is how X works" are verified, not trusted;
- a reviewer is itself often an agent — so the **human maintainer is the final
  approver** for merge ([ai-agent-permissions.md](ai-agent-permissions.md) §2);
- review depth scales with blast radius — an AI-authored architectural change
  gets Claude + human scrutiny; an AI-authored in-domain fix gets a normal pass.

## 8. What review is _not_

- Not a style debate — formatting and lint are automated; a reviewer does not
  re-litigate them.
- Not a redesign forum — a correct, in-domain implementation is not blocked
  because a reviewer would have done it differently.
- Not a gate to be widened under deadline pressure — the blockers in §5 are not
  negotiable per-PR; if a blocker is wrong, the _doctrine_ is amended, openly.

## Related documents

- [architecture-governance.md](architecture-governance.md) · [release-governance.md](release-governance.md) · [technical-debt-governance.md](technical-debt-governance.md) · [ai-agent-permissions.md](ai-agent-permissions.md)
- [.github/pull_request_template.md](../../.github/pull_request_template.md)
