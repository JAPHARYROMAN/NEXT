-- 001 — account-recovery-service schema.
-- recovery_codes: single-use codes (hashed). recovery_flows: in-progress recovery.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE recovery_codes (
    user_id    UUID NOT NULL,
    code_hash  BYTEA NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, code_hash)
);

CREATE TABLE recovery_flows (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    kind           TEXT NOT NULL CHECK (kind IN ('recovery_code','email','trusted_contact')),
    state          TEXT NOT NULL DEFAULT 'started'
                   CHECK (state IN ('started','challenged','completed','failed','expired')),
    challenge_hash BYTEA,
    attempts       INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ NOT NULL DEFAULT now() + interval '15 minutes'
);

CREATE INDEX recovery_flows_user_idx ON recovery_flows (user_id, created_at DESC);
