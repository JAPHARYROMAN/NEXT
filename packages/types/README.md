# @next/types

Cross-cutting TypeScript types for NEXT:

- **Branded IDs** (`UserId`, `VideoId`, …) — compile-time guarantees against ID swaps.
- **Media types** — `VideoMetadata`, `VideoRendition`, with Zod schemas.
- **Pagination** — Relay-style `Connection<T>` used everywhere.
- **Result** — tagged-union error handling.

Nothing in this package depends on any other workspace; everyone depends on it.
