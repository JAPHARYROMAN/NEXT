-- 001 — media-service schema.
-- The Video aggregate + its processing state machine + renditions.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE videos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id   UUID NOT NULL,
    title        TEXT NOT NULL,
    visibility   TEXT NOT NULL DEFAULT 'private'
                 CHECK (visibility IN ('public','unlisted','private','scheduled')),
    state        TEXT NOT NULL DEFAULT 'ingested'
                 CHECK (state IN ('uploading','uploaded','ingested','processing','ready','published','failed')),
    source_key   TEXT NOT NULL,
    duration_ms  BIGINT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX videos_creator_idx ON videos (creator_id, created_at DESC);
CREATE INDEX videos_published_idx ON videos (published_at DESC) WHERE state = 'published';

CREATE TABLE renditions (
    video_id     UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    rung         TEXT NOT NULL,
    codec        TEXT NOT NULL,
    object_key   TEXT NOT NULL,
    bytes        BIGINT NOT NULL DEFAULT 0,
    width        INT NOT NULL DEFAULT 0,
    height       INT NOT NULL DEFAULT 0,
    bitrate_kbps INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (video_id, rung)
);

CREATE OR REPLACE FUNCTION media_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_touch BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION media_touch_updated_at();
