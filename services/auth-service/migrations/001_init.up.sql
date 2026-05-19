-- 001 — initial auth-service schema.
-- Aligns with services/auth-service/README.md and the AuthService gRPC contract.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    handle          TEXT         NOT NULL UNIQUE,
    primary_email   TEXT,
    tier            TEXT         NOT NULL DEFAULT 'authenticated'
                                 CHECK (tier IN ('anonymous','authenticated','creator','partner','staff')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX users_handle_active_idx ON users (handle) WHERE deleted_at IS NULL;

CREATE TABLE credentials (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind            TEXT         NOT NULL CHECK (kind IN ('password','passkey','oauth')),
    -- For passkeys: WebAuthn credential ID + public key. For passwords: argon2id hash.
    -- For oauth: provider + subject. Storage is opaque to this schema.
    payload         JSONB        NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_used_at    TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX credentials_user_kind_idx ON credentials (user_id, kind) WHERE revoked_at IS NULL;

CREATE TABLE sessions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id       UUID         NOT NULL,         -- refresh-token family for theft detection
    device_id       TEXT,
    method          TEXT         NOT NULL CHECK (method IN ('password','passkey','oauth','magic_link','refresh')),
    ip_country      TEXT,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  NOT NULL,
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX sessions_user_active_idx ON sessions (user_id) WHERE revoked_at IS NULL;
CREATE INDEX sessions_family_idx      ON sessions (family_id);

CREATE TABLE refresh_tokens (
    -- Refresh tokens are opaque hashes stored server-side per [ADR 0012].
    -- Rotating: when used, mark `used_at`; if a token in this family is used twice,
    -- the whole family is revoked (theft signal).
    token_hash      BYTEA        PRIMARY KEY,
    session_id      UUID         NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    family_id       UUID         NOT NULL,
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  NOT NULL,
    used_at         TIMESTAMPTZ
);

CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);

-- Trigger to keep updated_at fresh.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_touch_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
