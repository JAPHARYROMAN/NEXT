# vector-pipelines

Embedding generation + Qdrant index maintenance. Hosts the Rust `indexer` (workspace member) that streams events from Kafka and upserts into Qdrant.

Owner: `@next-ecosystem/ml-platform`.

## Components
- **`src/next_vector_pipelines/`** (Python) — Ray Data batch jobs for offline embedding (catalog backfill, content re-embedding on model upgrade).
- **`indexer/`** (Rust) — long-running consumer of `media.video.transcoded.v1`, `community.post.created.v1`, etc. Calls the Triton embedding endpoint, upserts to Qdrant. ~1 k vec/s/pod.

## Embedding sources
- Text (titles, descriptions, transcripts) → `semantic-understanding/text@v1`.
- Image (thumbnails, keyframes) → `semantic-understanding/image@v1`.
- Audio (clips) → `semantic-understanding/audio@v1`.
- Video = pooled (image + audio + ASR-text) per shot.

## Operations
- Embedding-model upgrade: parallel collection (`videos_v2`) with shadow reads, then traffic switch.
- Snapshot to S3 every 6 h; restore tested quarterly.

## SLO
- `Event → indexed P95 < 60 s` (steady state).
- `Backfill throughput > 5 M vec/hr` (cluster-wide).
