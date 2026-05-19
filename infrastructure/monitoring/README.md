# Observability stack

Implements [ADR 0009](../../docs/adr/0009-observability.md): OTel everywhere → Prometheus + Tempo + Loki + Grafana.

```
monitoring/
├── otel-collector/
│   ├── agent.yaml        # DaemonSet config (per-node)
│   └── gateway.yaml      # Deployment config (cluster gateway)
├── prometheus/
│   └── values.yaml       # kube-prometheus-stack Helm values
├── grafana/
│   ├── values.yaml
│   ├── dashboards/       # JSON dashboards (provisioned)
│   └── datasources/
├── loki/
│   └── values.yaml
├── tempo/
│   └── values.yaml
├── alerting/
│   ├── slo.yaml          # Sloth SLO definitions
│   └── rules.yaml        # Prometheus alerting rules
└── README.md
```

## Pipeline

```
service ──OTLP──► otel-agent (DaemonSet) ──OTLP──► otel-gateway (Deployment)
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              ▼                        ▼                        ▼
                          Prometheus                 Tempo                    Loki
                          (metrics)                  (traces)                (logs)
                              │                        │                        │
                              └────────────────────────┴────────────────────────┘
                                                       │
                                                    Grafana
                                                       │
                                                  Alertmanager → PagerDuty + Slack
```

## SLO discipline

- Every service ships its SLO in `alerting/slo.yaml` (Sloth format).
- Burn-rate alerts use multi-window multi-burn-rate (Google SRE pattern).
- Pages are symptom-based (user-visible impact), not cause-based.

## Dashboards

- **Per-service golden signals** (RED) — latency P50/P95/P99, error rate, throughput.
- **USE** per node — utilization, saturation, errors.
- **Business KPIs** per product — DAU/MAU, video starts, live concurrent viewers.
- **ML model health** — inference latency, GPU utilization, error rate, drift score.
- **SLO burn** — per-service burn-rate panels.
