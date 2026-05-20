-- 001 — transcoding-service schema.
-- transcode_jobs: one per video; the ladder + per-rung progress is JSON.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE transcode_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id        UUID NOT NULL,
    source_key      TEXT NOT NULL,
    source_height   INT NOT NULL,
    state           TEXT NOT NULL DEFAULT 'queued'
                    CHECK (state IN ('queued','running','completed','failed')),
    ladder          JSONB NOT NULL DEFAULT '[]',
    completed_rungs TEXT[] NOT NULL DEFAULT '{}',
    claimed_by      TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX transcode_jobs_queued_idx ON transcode_jobs (created_at) WHERE state = 'queued';
CREATE INDEX transcode_jobs_video_idx ON transcode_jobs (video_id);
