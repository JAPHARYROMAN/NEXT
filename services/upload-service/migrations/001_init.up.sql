-- 001 — upload-service schema.
-- Session metadata only; chunk bytes live on disk (S3 multipart in production).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE upload_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id      UUID NOT NULL,
    content_type    TEXT NOT NULL,
    filename        TEXT NOT NULL DEFAULT '',
    total_bytes     BIGINT NOT NULL CHECK (total_bytes > 0),
    committed_bytes BIGINT NOT NULL DEFAULT 0 CHECK (committed_bytes >= 0),
    state           TEXT NOT NULL DEFAULT 'open'
                    CHECK (state IN ('open','finalizing','completed','failed')),
    object_key      TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX upload_sessions_creator_idx ON upload_sessions (creator_id, created_at DESC);

-- One row per received chunk. (offset, size) lets us compute the highest
-- contiguous committed offset for resume.
CREATE TABLE upload_parts (
    session_id  UUID NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
    part_offset BIGINT NOT NULL,
    part_size   BIGINT NOT NULL CHECK (part_size > 0),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, part_offset)
);
