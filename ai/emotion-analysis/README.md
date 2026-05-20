# emotion-analysis

Affective signal extraction. Estimates emotional tone across a video from facial expression, voice prosody, and language — used for content advisories, mood-based discovery, and highlight scoring.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.ingested.v1`)

1. **Face track** — per-shot face detection + tracking.
2. **Facial affect** — expression model → valence/arousal per track.
3. **Voice prosody** — audio model → arousal from pitch/energy/tempo.
4. **Language tone** — transcript sentiment from `speech-transcription` output.
5. **Fuse** — late fusion → per-scene emotion timeline.
6. **Persist** — write the emotion timeline to `media-metadata-service`.

## Doctrine

- Aggregate, never identify: no per-person affect profiles are stored.
- Outputs gate nothing for playback — advisory + discovery signal only.

## SLO

- Ingest → emotion timeline P95 < 4 min for videos ≤ 10 min.

See [MODEL_CARD.md](MODEL_CARD.md).
