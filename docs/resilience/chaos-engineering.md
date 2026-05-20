# NEXT Chaos Engineering

> A resilience design is a hypothesis until failure is injected on purpose.
> Chaos engineering is how NEXT proves — continuously — that the rest of this
> directory actually works.

## 0. Doctrine

- **Failure is injected deliberately, not awaited.** The platform's failure
  modes are exercised on a schedule, not discovered in production at 3 a.m.
- **Every experiment has a hypothesis.** "We believe the system stays within
  its steady state when X fails." An experiment confirms or falsifies it.
- **Blast radius is controlled.** Start small (one pod, staging), expand
  deliberately (a region, production game day).
- **An abort is always one action away.** Every experiment has a kill switch.
- **A failed experiment is a success** — it found a real weakness before a real
  user did. The output is a fix, tracked like an incident action item.

## 1. The steady-state hypothesis

Every experiment is framed against a measurable **steady state** — the SLIs of
[sre-doctrine.md](sre-doctrine.md). The form is always:

> _"While `<failure>` is injected, `<steady-state SLIs>` remain within
> `<bounds>`, degradation engages as designed, and the system self-heals on
> `<failure>` removal."_

If the SLIs hold and degradation behaves, the resilience design is validated. If
not, the experiment has found a defect.

## 2. The experiment catalog

Each maps directly to a resilience document it is meant to validate.

| Experiment                         | Injects                                                     | Validates                                                                                            |
| ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Pod / node kill**                | random service pod or EKS node termination                  | Kubernetes self-healing; no user impact                                                              |
| **AZ failure**                     | drop an availability zone                                   | multi-AZ redundancy ([global-topology.md](global-topology.md))                                       |
| **Regional outage**                | take a full region offline                                  | regional failover + DR runbook ([disaster-recovery.md](disaster-recovery.md))                        |
| **Kafka broker / partition chaos** | kill brokers, force leader elections, partition the cluster | event-stream resilience; zero Tier-0 loss ([event-stream-resilience.md](event-stream-resilience.md)) |
| **Database failover**              | kill a Postgres primary                                     | standby promotion; RPO/RTO targets                                                                   |
| **Cache failure**                  | flush / kill Redis                                          | cold-cache survivability; rebuild from source of truth                                               |
| **AI inference chaos**             | kill model servers / GPU nodes                              | degraded AI modes; feeds + playback unaffected ([ai-resilience.md](ai-resilience.md))                |
| **CDN / origin failure**           | disable a CDN or an origin region                           | multi-CDN + origin failover ([media-resilience.md](media-resilience.md))                             |
| **Dependency latency**             | inject latency into a service dependency                    | circuit breakers trip; fallbacks engage, no cascade                                                  |
| **Vector store loss**              | drop a Qdrant collection                                    | regeneration by event replay; degraded semantic mode                                                 |
| **Load / spike**                   | synthetic viral + live-concurrency surge                    | load shedding + edge absorption ([graceful-degradation.md](graceful-degradation.md))                 |

## 3. Maturity ladder

Chaos is adopted progressively; the platform earns its way up the ladder.

1. **Staging experiments** — every experiment runs in staging first, fully
   automated, on a schedule.
2. **Production game days** — scheduled, announced, supervised exercises in
   production: a region drained, a database failed over, with the team watching
   and a war room on standby.
3. **Continuous low-level chaos** — once a class of experiment is consistently
   green, a low-intensity always-on version runs in production (e.g. routine
   pod kills) so regressions are caught immediately.
4. **Adversarial game days** — security + resilience combined: a simulated DDoS
   or abuse surge exercised alongside the [incident-response.md](incident-response.md)
   process end to end.

A failure mode is not "covered" until its experiment is green at the appropriate
rung.

## 4. Running an experiment

```
 hypothesis ──▶ define steady state + bounds ──▶ scope blast radius
     │                                                │
     ▼                                                ▼
 announce (game day)              inject failure ──▶ observe SLIs ──▶ abort if bounds breached
     │                                                │
     ▼                                                ▼
 remove failure ──▶ confirm self-heal ──▶ record result ──▶ file fixes for any weakness
```

- **Tooling** — failure injection is automated (a chaos toolkit), version-
  controlled, and itself reviewed; chaos is code, not ad-hoc `kubectl delete`.
- **Observability is mandatory** — an experiment runs only with full telemetry;
  you cannot learn from a failure you cannot see.
- **Game-day discipline** — production game days are scheduled off-peak,
  announced to on-call, and have a named coordinator and a kill switch.

## 5. Game-day cadence

- **Per release train** — core experiments (pod/node kill, dependency latency)
  run automatically against staging.
- **Monthly** — a production game day exercising one major failure class
  (regional, database, Kafka, CDN) in rotation.
- **Quarterly** — a full regional-outage game day with the complete DR runbook
  and incident process exercised end to end.
- **Before a major launch** — a load + spike game day sized to the forecast peak
  ([capacity-planning.md](capacity-planning.md)).

## 6. From chaos finding to fix

A weakness found by chaos is treated exactly like an incident finding: it gets a
severity, an owner, and a tracked action item (in the technical-debt register
where it is architectural). The experiment is re-run after the fix to confirm
the steady state now holds. Resilience is ratcheted — once green, an experiment
stays in the suite to catch regressions.

## Related documents

- [sre-doctrine.md](sre-doctrine.md) · [disaster-recovery.md](disaster-recovery.md) · [incident-response.md](incident-response.md) · [graceful-degradation.md](graceful-degradation.md)
