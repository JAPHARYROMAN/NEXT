# Observability

Per [ADR 0009](adr/0009-observability.md). The complete pipeline lives in [`infrastructure/monitoring`](../infrastructure/monitoring).

## What every service emits

| Signal | How |
| --- | --- |
| Traces | OTLP spans for every inbound + outbound call |
| Metrics | Auto-instrumented (`http.server.duration`, `grpc.server.duration`, `kafka.produce.duration`, …) + custom domain metrics |
| Logs | Structured JSON, correlated with the active trace via `trace_id` + `span_id` |
| Health | `/healthz` (liveness), `/readyz` (deps healthy), `/metrics` (Prom scrape) |

Resource attributes pinned per pod: `service.name`, `service.namespace`, `service.version`, `deployment.environment`, `k8s.pod.name`, `k8s.namespace.name`.

## Sampling

- **Head sampling**: 100 % at the SDK; everything goes to the collector.
- **Tail sampling at the gateway**:
  - Errors: 100 %
  - High-latency (> 1 s): 100 %
  - Baseline: 1 %

This keeps storage cost predictable while preserving the *interesting* traces.

## SLO discipline

SLOs in [`infrastructure/monitoring/alerting/slo.yaml`](../infrastructure/monitoring/alerting/slo.yaml), authored in [Sloth](https://sloth.dev) format. Burn-rate alerts use the multi-window multi-burn-rate pattern (Google SRE):

- **Page** on a fast burn (2× burn rate over 1 h *and* 5 % over 5 min).
- **Ticket** on a slow burn (1× burn rate over 6 h).

Pages are symptom-based (latency, errors users see), never cause-based (CPU high).

## Dashboards

- `service-golden-signals.json` — generic RED per service.
- `slo-burn.json` — burn rate per SLO.
- `ml-workload.json` — Triton + vLLM queue depth, GPU utilization, model error rate.
- `kafka-topology.json` — broker, consumer lag, DLQ growth.
- `business-kpis.json` — DAU/MAU, video starts, live concurrent viewers, payment volume.

All authored as JSON committed to [`infrastructure/monitoring/grafana/dashboards`](../infrastructure/monitoring/grafana/dashboards) and provisioned via the Grafana Helm chart. No hand-edits in the UI.

## PII

Fields tagged `next.pii.*` are stripped in the collector pipeline (see [`gateway.yaml`](../infrastructure/monitoring/otel-collector/gateway.yaml)). Logs never contain raw emails, phone numbers, or IP addresses.

## Tracing in practice

```ts
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('@next/feed');
await tracer.startActiveSpan('feed.assemble', async (span) => {
  span.setAttribute('user.tier', tier);
  // ... work
  span.end();
});
```

Cross-language conventions in [`packages/{ts,go,rust,python}/telemetry`](../packages).
