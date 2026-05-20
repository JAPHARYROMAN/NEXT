<!--
  NEXT pull request template. Every box must be addressed — tick it, or write
  N/A with a one-line reason. A PR with unaddressed boxes is not ready to review.
  See docs/adr/README.md and .github/instructions/adr-governance.instructions.md.
-->

## Summary

<!-- What does this PR do, and why? 1–3 sentences. -->

## Authoring agent / owner

<!-- Which agent or person authored this, and which domain does it belong to?
     e.g. "Codex — /services". Cross-domain changes must link the assignment. -->

- Domain:
- Cross-domain assignment (if any):

## Governance checklist

### ADR impact

- [ ] This PR introduces **no** new architectural decision, **or** a new/superseding ADR is included or linked.
- [ ] This PR does **not** violate any Accepted ADR. (List the ADRs it touches: …)

### Ownership boundary

- [ ] All changed files are within the authoring agent's owned domain ([ADR 0034](../docs/adr/0034-monorepo-boundary-ownership.md)), or a cross-domain assignment is linked above.
- [ ] No unrelated / other-agent files were swept in (no blanket `git add -A`).

### Service runtime

- [ ] Backend changes are Go ([ADR 0007](../docs/adr/0007-backend-languages.md)); frontend is TS/React ([ADR 0014](../docs/adr/0014-frontend.md)); AI is Python ([ADR 0016](../docs/adr/0016-ai-serving.md)). No runtime was crossed.

### Event contract impact

- [ ] No event schema changed, **or** the change is versioned and consumers/docs are updated ([ADR 0008](../docs/adr/0008-event-bus.md), [ADR 0019](../docs/adr/0019-schema-first.md)).

### Database / migration impact

- [ ] No schema change, **or** a migration is included, reversible, and safe under concurrent writes ([ADR 0017](../docs/adr/0017-database-per-service.md)).

### Observability

- [ ] New code paths emit traces / metrics / logs via OpenTelemetry ([ADR 0009](../docs/adr/0009-observability.md)). No production service ships without observability.

### Security

- [ ] No secrets committed. Inputs validated at trust boundaries. AuthN/AuthZ unchanged or reviewed.

## Test evidence

<!-- Paste build/vet/test output or describe manual verification. Required. -->

## Rollback plan

<!-- How is this reverted if it misbehaves in production? -->
