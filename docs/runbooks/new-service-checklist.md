# New service checklist

A new microservice doesn't ship until everything below is in place. PR template enforces this.

## Code
- [ ] `services/<name>/` follows the template (cmd/server, internal/, proto/, migrations/).
- [ ] gRPC contract in `services/<name>/proto/<name>/v1/`.
- [ ] Event schemas (if any) in `packages/events/schemas/<domain>/v1/`.
- [ ] README documents API + events + data ownership + SLO.
- [ ] Service registered in `services/README.md` catalog.

## Repo / governance
- [ ] CODEOWNERS entry.
- [ ] go.work / Cargo workspace / pyproject workspace member added.
- [ ] commitlint scope added to `commitlint.config.cjs`.

## Infrastructure
- [ ] Helm `values-{dev,staging,prod}.yaml` under `infrastructure/kubernetes/apps/<name>/`.
- [ ] ArgoCD `Application` (auto-discovered via ApplicationSet — verify it appears).
- [ ] Database / Redis / Kafka topics provisioned via Terraform if needed.
- [ ] IRSA role + IAM policy committed.
- [ ] Vault path + policy under `infrastructure/security/vault/policies/<name>.hcl`.
- [ ] SPIFFE ID registered.

## Observability
- [ ] OTel auto-instrumented via `packages/{ts,go,rust}/telemetry`.
- [ ] Grafana dashboard JSON in `infrastructure/monitoring/grafana/dashboards`.
- [ ] SLO definition in `infrastructure/monitoring/alerting/slo.yaml`.
- [ ] Alert rules in `infrastructure/monitoring/alerting/rules.yaml` if non-SLO-driven.
- [ ] Runbook in `docs/runbooks/<name>.md`.

## CI / CD
- [ ] Service added to `image-build.yml` matrix.
- [ ] Coverage gate ≥ 75 %.

## On-call
- [ ] PagerDuty rotation defined.
- [ ] Escalation policy linked from the runbook.

## Sign-off
- [ ] CODEOWNERS approval from owning domain.
- [ ] Platform team review of Helm chart values.
- [ ] Security team review of Vault policies + AuthorizationPolicy.
