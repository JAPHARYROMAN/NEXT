# Release Governance

> How change gets from a merged PR to planetary production safely — release
> trains, canary rollout, feature flags, and a rollback path that is always
> open.

## 0. Principle

A release is the moment a change meets real users at scale. Release governance
makes that moment **boring**: predictable cadence, gradual exposure, automated
guardrails, and a rollback that is one action away. Excitement at release time
is a governance failure.

## 1. The branch → environment path

Per [ADR 0033](../adr/0033-multi-agent-governance.md):

```
 agent/* branch ──PR──▶ develop ──release train──▶ main ──GitOps──▶ production
   (per agent)        (integration)              (prod-stable)    (ArgoCD, ADR 0004)
```

- `develop` is the integration branch — where multi-agent work converges and is
  verified together.
- `main` is production-stable; it is only ever advanced by a release train.
- Production is reconciled from `main` by ArgoCD ([ADR 0004](../adr/0004-gitops-argocd.md))
  — the deployed state is always a git state.

## 2. Release trains

NEXT releases on **trains**, not on ad-hoc pushes:

- A train departs on a regular cadence; whatever is merged, verified, and green
  on `develop` rides it to `main`.
- A change that misses a train catches the next one — trains reduce the pressure
  to rush a risky change out _now_.
- A train is gated: it does not depart unless `develop` is green (all checks,
  the integration audit clean) and the error-budget state permits
  ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) — a service
  in an error-budget freeze does not ride the train except for fixes).
- **Out-of-train hotfix** — a production-critical fix may be released off-train,
  via an expedited but still-reviewed path, with human-maintainer approval.

## 3. Deployment approval

| Deployment                    | Approval                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Train to `main`               | green `develop` + release owner + human maintainer                                              |
| Canary progression (per step) | automated guardrails (§4) + release owner                                                       |
| Out-of-train hotfix           | human maintainer                                                                                |
| Production deploy             | **human-approved, never agent-autonomous** ([ai-agent-permissions.md](ai-agent-permissions.md)) |

## 4. Canary rollout

A release reaches production gradually, never all at once:

```
 1% ──▶ 5% ──▶ 25% ──▶ 50% ──▶ 100%
   each step held for a dwell time, gated on SLOs + guardrails
```

- At each step, the change's SLIs and the platform guardrails
  ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md)) are watched
  for a fixed dwell time.
- A guardrail breach at any step **auto-halts** the rollout and rolls back to the
  previous step's allocation, paging the release owner.
- Multi-region: canary progresses **region by region** — a change proves itself
  in one region before the next, so a regional blast radius caps a bad release.

## 5. Feature-flag doctrine

Per [ADR 0013](../adr/0013-feature-flags.md) (OpenFeature + GrowthBook):

- **Decouple deploy from release** — code ships dark behind a flag; the flag,
  not the deploy, exposes it. This makes the deploy low-risk and the exposure
  reversible without a redeploy.
- **Every non-trivial user-facing change ships behind a flag.**
- **Flags are temporary** — a flag has an owner and a removal plan; a flag fully
  rolled out and stable is **removed**, not left forever. Stale flags are
  tracked debt ([technical-debt-governance.md](technical-debt-governance.md)).
- **Kill switch** — a flag is the fastest rollback for a feature: flip it off,
  no deploy needed.

## 6. Rollback governance

Rollback is a **first-class, always-available action**, not an admission of
failure:

- **Flag off** — fastest; for a flagged feature, instant, no deploy.
- **Git revert** — NEXT is GitOps; reverting the manifest on `main` rolls
  production back via ArgoCD reconciliation ([incident-governance.md](incident-governance.md)).
- **Canary halt** — a rollout in progress halts and reverts to the prior step.
- **Rollback authority** — the release owner or the incident commander may roll
  back without further approval; **rolling back is never blocked by process**.
- Migrations are written reversible ([ADR 0017](../adr/0017-database-per-service.md)
  practice) precisely so rollback stays possible; a one-way migration is itself
  a reviewed, deliberate decision.

"Roll back first, root-cause after" ([docs/resilience/incident-response.md](../resilience/incident-response.md))
is doctrine.

## 7. Experimentation governance

Experiments are a release of a _different kind_ and are governed:

- **Recommendation / ranking experiments** run on the experimentation framework
  with **auto-aborting guardrail metrics** — exploration share, creator Gini,
  topic entropy, latency, regret rate
  ([docs/recommendation/experimentation.md](../recommendation/experimentation.md)).
  A guardrail breach halts the experiment automatically.
- **Experiment isolation** — two experiments touching the same pipeline stage
  are mutually exclusive unless declared orthogonal; the framework refuses
  overlapping assignment.
- **AI experiment isolation** — model changes run shadow → canary, scored before
  served, and never bypass the guardrails.
- **Creator-experiment safety** — an experiment that could affect creator reach
  or earnings has the creator-fairness guardrails as hard limits; creators are
  not silently experimented into reduced livelihood.
- **A permanent ~1% holdout** receives a frozen baseline, for long-horizon
  measurement of cumulative effects.
- **No experiment may remove an invariant** — there is no arm that disables the
  exploration floor, the creator cap, or interest-graph decay. Experiments tune
  _how_, never _whether_ the invariants hold.

## 8. Degraded-mode activation

Releases interact with the resilience layer: a release that detects trouble can
**engage degraded mode** ([docs/resilience/graceful-degradation.md](../resilience/graceful-degradation.md))
instead of failing — fall to a fallback, shed load, and let the canary halt
catch up. A release should never take the platform down; at worst it degrades it
briefly, then rolls back.

## Related documents

- [code-review-doctrine.md](code-review-doctrine.md) · [incident-governance.md](incident-governance.md) · [docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) · [docs/recommendation/experimentation.md](../recommendation/experimentation.md)
- [ADR 0004](../adr/0004-gitops-argocd.md) · [ADR 0013](../adr/0013-feature-flags.md)
