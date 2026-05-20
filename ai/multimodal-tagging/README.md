# multimodal-tagging

Content tagging + categorization. Assigns category labels, topic tags, and a content-safety taxonomy to a video by fusing vision, audio, and transcript signals.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.ingested.v1`)

1. **Gather** — keyframes, transcript, detected objects, audio events.
2. **Encode** — multimodal encoder → a fused video representation.
3. **Tag** — linear probes → category, topics, language, content-safety labels.
4. **Calibrate** — temperature-scaled confidences; low-confidence tags flagged for review.
5. **Persist** — write tags to `media-metadata-service`; emit `media.processing.stage.v1` (stage=`understand`).

## Doctrine

- Tags enrich discovery; they do not gate playback (degrade, never block — ADR 0028).
- Safety labels are a signal into `moderation-service`, not a verdict.

## SLO

- Ingest → tags P95 < 3 min for videos ≤ 10 min.
- Top-1 category accuracy > 0.88 on the internal eval set.

See [MODEL_CARD.md](MODEL_CARD.md).
