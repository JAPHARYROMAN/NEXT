# video-intelligence

Video understanding pipeline: shot detection, scene tagging, OCR, ASR (speech-to-text), object detection, key-frame selection.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, runs on new video ingest)
1. **Decode + sample** — extract keyframes + audio.
2. **Shot detection** — TransNetV2 → shot boundary timestamps.
3. **ASR** — Whisper-large → transcript + word-level timestamps.
4. **OCR** — PaddleOCR on keyframes → on-screen text.
5. **Tagging** — multimodal encoder + linear probe → category labels.
6. **Object detection** — YOLOv10 → object presence per shot.
7. **Embedding** — push embeddings to Qdrant via `vector-pipelines`.
8. **Persist** — write enriched metadata to media-service via gRPC.

## Online endpoints
- Inference triggered by `media.video.ingested.v1`.
- Backpressure via Ray autoscaler; spot-friendly worker fleet.

## SLO
- Ingest → tag complete P95 < 5 min for videos ≤ 10 min.
- ASR accuracy > 85 % WER on internal eval set.

See [MODEL_CARD.md](MODEL_CARD.md).
