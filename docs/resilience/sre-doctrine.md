# NEXT SRE Doctrine

> Reliability is engineered, measured, and budgeted — not hoped for. This
> document defines how NEXT sets reliability targets, measures them, decides
> when to ship versus stabilize, and keeps observability alive when it is needed
> most.

## 0. Doctrine

- **Measure user-perceived reliability, not server uptime.** An SLO is about
  what a user experiences, not whether a process is running.
- **100% is the wrong target.** Perfect reliability is impossible and
  prohibitively expensive; the right target is one users do not notice missing.
- **The error budget is a shared currency** between shipping features and
  protecting reliability.
- **Alert on symptoms, not causes.** Page a human when users are hurting, not
  when a metric twitches.

## 1. SLIs — what we measure

A Service Level **Indicator** is a measured ratio of good events to total
events. NEXT's core SLIs:

| SLI              | Definition                                                   |
| ---------------- | ------------------------------------------------------------ |
| Availability     | successful requests / total requests, per service            |
| Latency          | requests served within the target / total requests           |
| Playback success | playback sessions that start and run without fatal error     |
| Playback quality | sessions below a rebuffer-ratio threshold (QoE)              |
| Feed success     | feed requests returning a non-empty, on-time slate           |
| Freshness        | event-derived projections within their lag target            |
| Correctness      | for stateful services, writes that do not violate invariants |

SLIs are computed from real traffic (and from the QoE telemetry the player and
recommendation systems already emit), not synthetic probes alone.

## 2. SLOs — the targets

A Service Level **Objective** is a target for an SLI over a window (28 days).
SLOs are tiered ([global-topology.md](global-topology.md) §4) — a T0 service is
held to a stricter objective than a T3 one.

Representative SLOs (the per-service READMEs hold the authoritative numbers;
these illustrate the shape):

| Surface                        | SLO                                              |
| ------------------------------ | ------------------------------------------------ |
| Auth (T0)                      | 99.95% availability; p99 latency target          |
| Playback start (T0)            | 99.9% of starts succeed; p95 start-time target   |
| api-gateway (T0)               | 99.95% availability                              |
| Feed first page (T1)           | 99.5% on-time; p75 < 200 ms                      |
| Recommendation end-to-end (T2) | p75 < 130 ms; degraded fallback always available |
| Analytics freshness (T2)       | rollups within minutes                           |

An SLO is a promise _and_ a ceiling — see error budgets.

## 3. Error budgets

The error budget is `1 − SLO` — the allowed amount of unreliability in the
window. It is the central decision tool:

- **Budget remaining** → the team may ship freely; reliability is within
  promise.
- **Budget low / exhausted** → a **change freeze** on that service: only
  reliability work and critical fixes ship until the budget recovers. New
  features wait.
- A burned budget is not a blame event — it is a signal that routes effort from
  features to stability automatically.

This makes the ship-vs-stabilize decision _data-driven and pre-agreed_, instead
of an argument during every incident.

## 4. Alerting doctrine

- **Symptom-based, SLO-burn alerts.** The primary page fires on **error-budget
  burn rate** — "at this rate the budget is gone in N hours" — not on raw CPU,
  memory, or a single failed request.
- **Multi-window burn alerts** — a fast-burn alert (acute outage) and a
  slow-burn alert (chronic degradation) so both a cliff and a slope are caught.
- **Cause metrics are for dashboards, not pages.** CPU, queue depth, GC, and
  the like inform diagnosis; they do not wake a human on their own.
- **Every page is actionable.** An alert with no clear response is deleted or
  demoted — alert fatigue is itself a reliability risk.

## 5. Incident severity & escalation

Severity classification and the full incident process live in
[incident-response.md](incident-response.md). In summary: SEV1 (critical,
platform-wide) → SEV4 (minor); escalation chains route by service ownership
([ADR 0034](../adr/0034-monorepo-boundary-ownership.md)) and severity, with a
defined on-call rotation per domain.

## 6. Observability stack

Per [ADR 0009](../adr/0009-observability.md): OpenTelemetry instrumentation →
collector → Prometheus (metrics), Tempo (traces), Loki (logs), Grafana
(dashboards). Every NEXT service is instrumented (the Phase 10 audit confirmed
all functional services emit OTel) and exposes `/healthz` + `/readyz`.

Dashboard tiers:

- **Executive** — platform-wide SLO health, error-budget status per service, the
  current degradation level per region ([graceful-degradation.md](graceful-degradation.md)).
- **Service** — per-service SLIs, dependencies, saturation.
- **Incident** — a focused view assembled per incident.

## 7. Tracing & telemetry survivability

Observability that dies during an incident is observability that fails when it
matters most. So:

- **The collector is not a SPOF** — OTel collectors run replicated per region;
  loss of one does not blind the region.
- **Telemetry degrades gracefully** — under extreme load, **tail-based
  sampling** keeps all error and high-latency traces while shedding routine
  ones; metrics (cheap, aggregate) are preserved over traces (expensive,
  detailed).
- **Telemetry buffers** — agents buffer locally through a transient collector
  outage rather than dropping signal on the floor.
- **Health endpoints are dependency-light** — `/healthz` and `/readyz` must work
  even when the service's dependencies are struggling, so failover logic can
  trust them.
- Observability has its **own modest error budget** — if the platform can serve
  users but cannot see them, that is itself a SEV-class problem.

## 8. Reliability practices

- **Blameless post-incident reviews** for every SEV1/SEV2 — the artifact is a
  list of systemic fixes, not a list of people.
- **Production readiness review** before a service is promoted past `functional`
  maturity (the Phase 10 audit defined this gate): SLOs defined, dashboards
  exist, runbook exists, alerts wired, load-tested, chaos-tested.
- **Toil budget** — repetitive operational work is tracked; past a threshold it
  is automated rather than endured.
- SLOs, error-budget policy, and runbooks are **living documents**, reviewed
  each operational phase.

## Related documents

- [incident-response.md](incident-response.md) · [chaos-engineering.md](chaos-engineering.md) · [capacity-planning.md](capacity-planning.md) · [graceful-degradation.md](graceful-degradation.md)
- [ADR 0009 — Observability](../adr/0009-observability.md)
