# Production deployment

End-to-end how-it-ships and how-it-rolls-back.

## The path from PR to prod

```
PR opened          ──►  CI: lint + test + build + security scan + dependency review
PR merged to main  ──►  image-build.yml builds + signs + scans + pushes to ghcr.io
                   ──►  Renovate / Image Updater bumps the tag in
                        infrastructure/kubernetes/apps/<svc>/values-<env>.yaml
ArgoCD sees change ──►  Renders Helm + applies to dev (auto)
                   ──►  Renders Helm + applies to staging (auto on tag promotion)
                   ──►  Renders Helm + applies to prod (manual gate)
                        Argo Rollouts canaries Tier-1 services (5%→25%→100%)
                        based on Prometheus SLO analysis
Smoke + soak       ──►  Post-deploy synthetic checks; on-call paged on regression
```

## Promotion gates

| Environment | Promotion trigger | Approval |
| --- | --- | --- |
| `dev` | Push to main | None |
| `staging` | Image build complete + CI green | None (automatic) |
| `prod` | Tag on main + 24 h soak in staging | Manual sync in ArgoCD UI by deployer-on-rotation |

## Canary (Tier 1 services)

Argo Rollouts strategy:

```yaml
strategy:
  canary:
    steps:
      - setWeight: 5
      - pause: { duration: 5m }
      - analysis: { templates: [{ templateName: slo-burn }] }
      - setWeight: 25
      - pause: { duration: 15m }
      - analysis: { templates: [{ templateName: slo-burn }] }
      - setWeight: 100
```

Analysis template runs PromQL queries:
- error_rate < 1.5× baseline
- p95_latency < 1.5× baseline
- saturation < 90 %

Failure → automatic abort + traffic shift back to stable.

## Rollback

| Trigger | Action |
| --- | --- |
| Argo Rollouts analysis fails | Automatic rollback, no human action. |
| Post-deploy alert pages oncall | `argocd app rollback <service> <revision>` — sync to previous Helm release. |
| Bad infra | `git revert` the Terraform change → `tf:apply` runs from CI. |
| Bad library version | Revert Changesets release PR; downstream services rebuild. |

## Feature flags

Significant new behavior ships dark. Procedure:

1. New flag in [`packages/feature-flags/flags`](../packages/feature-flags/flags).
2. Code gated by `evaluate('feed.muted-creators', false)`.
3. Rollout in GrowthBook: 1 % → 10 % → 50 % → 100 % with SLO checks at each step.
4. Once 100 % and stable for two weeks, file a follow-up to remove the flag.

## Deploy windows

- No deploys to prod 18:00 – 07:00 UTC except for incident remediation.
- No deploys to prod during the platform Freeze announced by the launch council (typically two weeks per quarter).
- Tier-1 services deploy only when at least one oncall engineer is online.

## Post-incident

Every Sev 1 / Sev 2 incident gets a blameless post-mortem within 5 business days, filed under `docs/postmortems/yyyy-mm-dd-<slug>.md`.
