# @next/logger

Structured logging for NEXT.

- Pino-based in Node services.
- Auto-correlates with the active OpenTelemetry trace (adds `trace_id` and `span_id`).
- Redacts known PII keys before emission.
- Pretty-printed locally, JSON in production.

```ts
import { createLogger } from '@next/logger';

const log = createLogger({ service: 'feed-service', env: 'prod', version: process.env.VERSION });

log.info({ user: { id: userId } }, 'feed served');
```

A browser variant is exported at `@next/logger/browser` for client-side telemetry batching.
