# @next/feature-flags

OpenFeature SDK wrapper + the typed flag registry. Per [ADR 0013](../../docs/adr/0013-feature-flags.md).

```ts
import { initFlags, evaluate, FLAGS } from '@next/feature-flags';

await initFlags({ apiHost: 'https://flags.next.io', clientKey: process.env.GROWTHBOOK_KEY! });

const muted = await evaluate(FLAGS['feed.muted-creators'].key, false, { userId, tier: 'creator' });
```

Adding a flag:
1. Add an entry to `flags/index.ts` with owner + `addedAt`.
2. Reference it via the typed `FLAGS` map (CI fails on string-literal flag keys).
3. Define rollout in GrowthBook.

Stale flags older than 90 days are reported in CI weekly; the owning team is paged to clean up.
