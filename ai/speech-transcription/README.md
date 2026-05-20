# speech-transcription

Automatic speech recognition. Produces word-level transcripts and translations from a video's audio track — the source for auto-captions, search transcripts, and language tone in `emotion-analysis`.

Owner: `@next-ecosystem/ml-media`.

## Pipeline (Ray Data DAG, triggered on `media.video.ingested.v1`)

1. **Demux audio** — extract + resample to 16 kHz mono.
2. **VAD** — voice-activity segmentation to skip silence.
3. **Transcribe** — Whisper-large-v3 → word-level timestamps.
4. **Diarize** — speaker turns via pyannote.
5. **Translate** — fan out to target languages on demand.
6. **Persist** — emit `ai.speech.transcribed.v1`; consumed by `subtitle-service`.

## Online endpoints

- Triggered by ingest; GPU worker fleet, spot-friendly.

## SLO

- Ingest → transcript P95 < 2 min for videos ≤ 10 min.
- WER < 12 % on the internal multi-accent eval set.

See [MODEL_CARD.md](MODEL_CARD.md).
