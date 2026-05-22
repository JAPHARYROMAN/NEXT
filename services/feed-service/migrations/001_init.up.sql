-- 001 — feed-service schema.
-- Session state (seen set + cross-page fatigue), experiment assignments, and
-- the impression log. The feed itself is not stored — it is reassembled from a
-- ranked slate on every request (ADR 0017: feed is reconstructable).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE feed_sessions (
    session_id  UUID PRIMARY KEY,
    user_id     UUID NOT NULL,
    surface     TEXT NOT NULL,
    page_count  INT NOT NULL DEFAULT 0,
    fatigue     DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feed_sessions_user_idx ON feed_sessions (user_id);

-- Content already shown this session — drives cross-page deduplication.
CREATE TABLE feed_seen (
    session_id UUID NOT NULL REFERENCES feed_sessions(session_id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, content_id)
);

-- Sticky experiment arm assignment, one row per (user, experiment).
CREATE TABLE experiment_assignments (
    user_id        UUID NOT NULL,
    experiment_key TEXT NOT NULL,
    arm            TEXT NOT NULL,
    assigned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, experiment_key)
);

CREATE TABLE feed_impressions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL,
    content_id  TEXT NOT NULL,
    kind        TEXT NOT NULL
                CHECK (kind IN ('view','click','skip','complete')),
    dwell_ms    BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feed_impressions_session_idx ON feed_impressions (session_id, created_at DESC);
