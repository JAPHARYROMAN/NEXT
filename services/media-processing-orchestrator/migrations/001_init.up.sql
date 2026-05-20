-- 001 — media-processing-orchestrator schema.
-- pipeline_runs: one saga per video. stage_status: per-stage progress.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE pipeline_runs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id   UUID NOT NULL UNIQUE,
    source_key TEXT NOT NULL,
    state      TEXT NOT NULL DEFAULT 'running'
               CHECK (state IN ('running','completed','failed')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stage_status (
    run_id   UUID NOT NULL REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    stage    TEXT NOT NULL CHECK (stage IN ('transcode','thumbnail','subtitle','understand','index')),
    status   TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','running','succeeded','failed')),
    attempts INT NOT NULL DEFAULT 0,
    detail   TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (run_id, stage)
);
