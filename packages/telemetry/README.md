# @next/telemetry

OpenTelemetry SDK wrappers, preconfigured for NEXT.

- Auto-instrumentation for HTTP, gRPC, Postgres, Redis, Kafka, fetch.
- Resource attributes pinned (`service.name`, `service.namespace`, `service.version`, `deployment.environment`).
- Exports OTLP/gRPC to the in-cluster collector.
- Graceful shutdown on SIGTERM/SIGINT.

```ts
import { initTelemetry } from '@next/telemetry';

initTelemetry({
  service: 'feed-service',
  namespace: 'next-feed',
  env: 'prod',
  version: process.env.VERSION,
});
```

For browsers, use `@next/telemetry/web`.
