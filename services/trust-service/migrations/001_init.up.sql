-- 001 — trust-service schema.
-- trust_scores: one row per account. verifications: granted badges.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE trust_scores (
    user_id    UUID PRIMARY KEY,
    score      DOUBLE PRECISION NOT NULL DEFAULT 0.5
               CHECK (score >= 0.0 AND score <= 1.0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE verifications (
    user_id     UUID NOT NULL,
    kind        TEXT NOT NULL CHECK (kind IN
                ('creator','partner','organization','public_figure','official_account')),
    granted_by  UUID NOT NULL,
    evidence    TEXT NOT NULL DEFAULT '',
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at  TIMESTAMPTZ,
    PRIMARY KEY (user_id, kind)
);

CREATE INDEX verifications_active_idx ON verifications (user_id) WHERE revoked_at IS NULL;

-- Append-only signal log feeds re-scoring + audit (which signal moved a score).
CREATE TABLE penalty_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    signal     TEXT NOT NULL,
    delta      DOUBLE PRECISION NOT NULL,
    note       TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX penalty_log_user_idx ON penalty_log (user_id, created_at DESC);
