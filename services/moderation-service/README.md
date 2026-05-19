# moderation-service

Content + behavior moderation. Receives signals from `moderation-models` (CSAM, toxicity, abuse), human reports, automated heuristics. Holds a queue of cases and a policy engine.

Owner: `@next-ecosystem/trust-safety`.

## Public API
- Internal only. Admin console at `apps/admin/moderation`.

## Internal gRPC
- `CaseService.Open(input) → Case`
- `CaseService.Decide(case_id, decision) → Case`
- `PolicyService.Evaluate(content_id) → Decision`

## Events
**Emitted**: `moderation.case.opened.v1`, `moderation.case.decided.v1`, `moderation.flag.raised.v1`.
**Consumed**: `media.video.ingested.v1`, `media.video.published.v1`, `community.post.created.v1`, model inference outputs from `moderation-models`.

## Data
- `cases`, `decisions`, `appeals`, `policies` in `moderation_pg`.
- High-recall hash store (perceptual hashes, fingerprints) in `moderation_clickhouse`.

## SLO
- `Auto-flag → human queue P95 < 30 s` for tier-1 violations.
- `Case decision audit completeness: 100 %` (every decision has an audit event).

## Compliance
- Decisions retained 7 years; immutable audit trail.
- CSAM matches reported to NCMEC via the encrypted reporting channel; auto-actions are conservative + reviewable.

[Runbook](../../docs/runbooks/moderation-service.md).
