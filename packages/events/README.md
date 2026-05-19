# @next/events

Kafka producer + consumer + the canonical topic catalog.

- Idempotent producer with W3C trace context propagation in headers.
- Consumer extracts the parent trace and starts a child span per message.
- Topic names are constants — no string literals at call sites.

```ts
import { EventProducer, TOPICS } from '@next/events';

const events = new EventProducer({ brokers: process.env.KAFKA_BROKERS!.split(','), clientId: 'media-service' });
await events.connect();
await events.emit({
  topic: TOPICS.MEDIA_VIDEO_PUBLISHED,
  key: videoId,
  value: { id: videoId, creatorId, publishedAt: new Date().toISOString() },
});
```

Event schemas live under `schemas/` and are also generated to Go, Python, and Rust via `buf generate`.
