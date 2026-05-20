-- 001 — recommendation-service schema.
-- Served-slate log + per-item score breakdown + feedback. The slate log makes
-- "why was I shown this" answerable and powers offline replay.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE served_slates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,
    session_id        UUID NOT NULL,
    surface           TEXT NOT NULL,
    mode              TEXT NOT NULL
                      CHECK (mode IN ('precision','discovery','chaos')),
    appetite          DOUBLE PRECISION NOT NULL DEFAULT 0,
    item_count        INT NOT NULL DEFAULT 0,
    exploration_share DOUBLE PRECISION NOT NULL DEFAULT 0,
    creator_gini      DOUBLE PRECISION NOT NULL DEFAULT 0,
    topic_entropy     DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_creator_share DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX served_slates_user_idx ON served_slates (user_id, created_at DESC);
CREATE INDEX served_slates_session_idx ON served_slates (session_id);

-- One row per item in a served slate, in served order.
CREATE TABLE slate_items (
    slate_id         UUID NOT NULL REFERENCES served_slates(id) ON DELETE CASCADE,
    position         INT NOT NULL,
    content_id       TEXT NOT NULL,
    creator_id       UUID NOT NULL,
    relevance        DOUBLE PRECISION NOT NULL DEFAULT 0,
    novelty          DOUBLE PRECISION NOT NULL DEFAULT 0,
    diversity_margin DOUBLE PRECISION NOT NULL DEFAULT 0,
    final_score      DOUBLE PRECISION NOT NULL DEFAULT 0,
    exploration      BOOLEAN NOT NULL DEFAULT FALSE,
    sources          TEXT[] NOT NULL DEFAULT '{}',
    PRIMARY KEY (slate_id, position)
);

-- Feedback signals join back to slate_items for attribution + replay.
CREATE TABLE feedback (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slate_id    UUID NOT NULL REFERENCES served_slates(id) ON DELETE CASCADE,
    content_id  TEXT NOT NULL,
    kind        TEXT NOT NULL
                CHECK (kind IN ('impression','click','skip','complete','hide')),
    dwell_ms    BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_slate_idx ON feedback (slate_id);
