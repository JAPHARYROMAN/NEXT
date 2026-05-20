-- 001 — notification-auth-service schema.
-- challenges: out-of-band approval challenges for step-up authentication.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE challenges (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    action        TEXT NOT NULL,
    token_hash    BYTEA NOT NULL,
    state         TEXT NOT NULL DEFAULT 'pending'
                  CHECK (state IN ('pending','approved','denied','expired','cancelled')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ NOT NULL,
    resolved_at   TIMESTAMPTZ
);

CREATE INDEX challenges_user_idx ON challenges (user_id, created_at DESC);
CREATE INDEX challenges_pending_idx ON challenges (state) WHERE state = 'pending';
