# 0009. Observability: OpenTelemetry → Prometheus + Tempo + Loki

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/sre @next-ecosystem/platform
- **Tags**: observability, infrastructure

## Context

We need a single observability pipeline that handles metrics, traces, and logs for every service, every AI workload, and every infrastructure component, with a unified query surface for oncall and a clean separation between collection and storage so we can swap backends without changing services.

## Decision

- **OpenTelemetry** is the only instrumentation API. All services emit OTLP.
- **OpenTelemetry Collector** runs as DaemonSet (agent) plus Deployment (gateway). The gateway does tail-based sampling, attribute enrichment, and PII scrubbing.
- **Prometheus** stores metrics (Mimir for long-term in v2).
- **Tempo** stores traces.
- **Loki** stores logs.
- **Grafana** is the unified query and dashboarding surface. Provisioned as code.
- **Alertmanager → PagerDuty** for paging; **Alertmanager → Slack** for non-paging.

## Alternatives considered

- **Datadog / New Relic / Honeycomb** — excellent products but priced per-host or per-event at our scale becomes prohibitive. We may layer Honeycomb on top of OTLP for high-value teams in the future without lock-in (OTLP is portable).
- **Elastic stack** — operationally heavy for traces; metrics story weaker than Prometheus.
- **Native AWS (CloudWatch + X-Ray)** — strong on infra logs; weak unified query story; locks us into one cloud.

## Consequences

### Positive
- OTLP everywhere → portable instrumentation. Swap the backend, not the services.
- Unified query in Grafana across metrics, traces, logs.
- Tail-based sampling at the gateway keeps trace storage cost sane without losing the interesting traces.

### Negative
- We operate the storage tier: Prometheus / Mimir, Tempo, Loki are now SRE responsibilities.
- Grafana-as-code adds a small PR-time overhead vs UI-edited dashboards.

## Implementation notes

- Each service's `packages/{ts,go,rust,python}/telemetry` wraps the OTLP SDK with the project's resource attributes (`service.name`, `service.namespace`, `deployment.environment`, `service.version`).
- PII fields tagged with `next.pii=true` and scrubbed in the gateway processor.
- SLO definitions managed via [Sloth](https://sloth.dev) generators committed to git.
- Grafana dashboards live in [`infrastructure/monitoring/grafana/dashboards`](../../infrastructure/monitoring) as JSON.
