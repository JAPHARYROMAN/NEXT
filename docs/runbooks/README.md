# Runbooks

One runbook per service + a handful of cross-cutting topics. Linked from every alert.

```
runbooks/
├── auth-service.md
├── profile-service.md
├── media-service.md
├── upload-service.md
├── live-service.md
├── feed-service.md
├── recommendation-service.md
├── search-service.md
├── community-service.md
├── payment-service.md
├── notification-service.md
├── moderation-service.md
├── analytics-service.md
├── event-gateway.md
├── api-gateway.md
├── kafka.md
├── vault.md
├── eks.md
└── new-service-checklist.md
```

## Format

Every runbook has these sections:

1. **What this service does** (one paragraph, links to README).
2. **SLOs** (copy-paste from slo.yaml).
3. **Dashboards** (Grafana links).
4. **Common alerts** — for each alert: meaning + first response.
5. **Common operations** — restart, rolling restart, scale, drain, snapshot, restore.
6. **Escalation** — who to page, when.

## Authoring

New services *must* ship a runbook in the same PR that registers the on-call rotation. CI verifies that every alert has a `runbook` annotation pointing to a file in this directory.
