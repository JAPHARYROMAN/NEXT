# Stream Health UI

## Components

- `@next/broadcast-ui` `StreamHealthMetrics` — bitrate, latency, frames, ingest, A/V, QoE
- `@next/studio-components` `LiveHealthPanel` — summary chart (Phase 9)

## Severity

- `ok` — success tone, calm copy
- `watch` — accent, informational hints
- `attention` — danger tone only when truly needed

## Telemetry

- `trackStreamHealthPanel(metric, viewedMs)`

## Placeholders

- Values from `demo-broadcast.ts` — wire to observability pipeline later
