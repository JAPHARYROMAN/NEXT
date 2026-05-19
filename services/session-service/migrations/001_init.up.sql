-- 001 — session-service schema.
-- Owned exclusively by session-service per [ADR 0021].

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    family_id      UUID NOT NULL,
    method         TEXT NOT NULL CHECK (method IN ('password','passkey','oauth','magic_link','refresh')),
    device_id      TEXT,
    ip_country     TEXT,
    user_agent     TEXT,
    started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ NOT NULL,
    revoked_at     TIMESTAMPTZ
);

CREATE INDEX sessions_user_active_idx ON sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX sessions_family_idx      ON sessions (family_id);

CREATE TABLE refresh_tokens (
    -- Opaque refresh tokens are SHA-256-hashed at rest.
    -- A used token re-presented (used_at IS NOT NULL re-validation) is theft.
    token_hash   BYTEA PRIMARY KEY,
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    family_id    UUID NOT NULL,
    issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ NOT NULL,
    used_at      TIMESTAMPTZ
);

CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);
