# scene-detection

Shot + scene boundary detection. Splits a video into shots (hard/soft cuts) and groups them into semantic scenes — the structural backbone for thumbnails, clip generation, and chapter inference.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.ingested.v1`)

1. **Decode + sample** — uniform frame sampling at 2 fps.
2. **Shot boundaries** — TransNetV2 → hard/soft cut timestamps.
3. **Scene grouping** — agglomerative clustering of shot embeddings.
4. **GOP alignment** — snap boundaries to the nearest keyframe for clean cuts.
5. **Persist** — emit `media.scene.detected.v1`; results consumed by `video-segmentation-service`.

## Online endpoints

- Triggered by ingest; backpressure via the Ray autoscaler.

## SLO

- Ingest → boundaries P95 < 90 s for videos ≤ 10 min.
- Boundary F1 > 0.92 on the internal cut-detection eval set.

See [MODEL_CARD.md](MODEL_CARD.md).
