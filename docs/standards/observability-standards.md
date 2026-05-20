# Observability Standards

> The non-negotiable observability floor for every production service. Grounded
> in [ADR 0009](../adr/0009-observability.md) and the
> [SRE doctrine](../resilience/sre-doctrine.md).

Status: **binding**. **No production service ships without observability.**

## 1. The mandatory floor

Every production service **MUST** emit, with no exceptions:

| Signal          | Requirement                                                       |
| --------------- | ----------------------------------------------------------------- |
| **Tracing**     | OpenTelemetry spans; `otelgrpc` on gRPC, `otelhttp` on HTTP       |
| **Metrics**     | Prometheus metrics, including the minimum set (§3)                |
| **Logs**        | structured JSON, with correlation context                         |
| **Health**      | `/healthz` (liveness) + `/readyz` (readiness, dependency-probing) |
| **Correlation** | W3C trace context propagated across gRPC and Kafka                |
| **Errors**      | every error path instrumented — counted and traced                |

A service missing any row does not pass review. The Phase 10 audit confirmed
all functional services meet this; new services inherit it via the `_template`.

## 2. Tracing

- The OTel SDK is initialized in `cmd/server/main.go` via the shared `telemetry`
  package; an OTLP exporter ships spans to the collector.
- A composite propagator (`TraceContext` + `Baggage`) is installed so traces are
  not islanded across services.
- Trace context is carried on **Kafka headers** so a trace spans producer →
  event → consumer.
- Sampling is tail-based under load — all error and high-latency traces are
  kept ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) §7).

## 3. Minimum metrics

Every service exposes at least:

- **RED** — Request rate, Error rate, Duration (latency histogram) per endpoint.
- **Saturation** — for each pooled resource (DB pool, worker pool, queue depth).
- **Dependency health** — success/error/latency for each downstream call.
- **Domain SLIs** — the service's own SLIs ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md)):
  e.g. playback-start success, feed on-time rate, entitlement-check latency.

Event producers/consumers additionally expose: produce rate, consume lag, DLQ
rate, processing duration.

## 4. Logging

- **Structured JSON** — one event per line, machine-parseable.
- Every log line carries `trace_id` / `span_id` / `correlation_id` so logs join
  to traces.
- Levels are used correctly — `error` is actionable; routine flow is `info` or
  `debug`.
- **Sensitive data is redacted** — no secrets, no PII, no card data, no payout
  details in logs ([security-standards.md](security-standards.md)).
- Logs are shipped to Loki; logs are a stream, not a per-instance file.

## 5. Health endpoints

- `/healthz` — **liveness**: is the process up. Dependency-light — it must
  answer even when dependencies are struggling, so failover/orchestration can
  trust it.
- `/readyz` — **readiness**: is the service able to serve. Probes real
  dependencies (DB ping, etc.).
- gRPC services additionally register `grpc_health_v1`.

## 6. Dashboards & alerting

- **Dashboard ownership** — each service owns a Grafana dashboard of its SLIs
  and saturation; each domain owns a domain dashboard; the platform has an
  executive SLO/error-budget board.
- **Alerting is symptom-based** — the primary page fires on **SLO error-budget
  burn**, not on a raw cause metric ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) §4).
- Multi-window burn alerts catch both an acute cliff and a chronic slope.
- Every alert is actionable and links to a runbook; a non-actionable alert is
  deleted or demoted.

## 7. Telemetry survivability

Observability must survive the incident it is needed for: OTel collectors are
replicated per region; telemetry buffers through a transient collector outage;
under extreme load, traces are sampled but metrics and error traces are
preserved ([docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) §7).

## 8. Frontend observability

Apps emit via `@next/telemetry`: Core Web Vitals, route performance, error
instrumentation, and media QoE ([frontend-standards.md](frontend-standards.md) §8).

## 9. Prohibited patterns

- ✗ A production service with no tracing, metrics, or health endpoints.
- ✗ Unstructured / plain-text logs.
- ✗ Secrets or PII in logs.
- ✗ Logs that cannot be joined to a trace (no correlation id).
- ✗ An inference path with no telemetry ([ai-system-standards.md](ai-system-standards.md)).
- ✗ Alerting on raw cause metrics as the primary page.
- ✗ A `/healthz` that depends on downstream health (it must answer when
  dependencies are down).

## Related

- [ADR 0009](../adr/0009-observability.md) · [docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md) · [go-service-standards.md](go-service-standards.md) · [security-standards.md](security-standards.md)
