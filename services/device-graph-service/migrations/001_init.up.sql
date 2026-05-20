-- 001 — device-graph-service schema.
-- devices: the device → user inventory. device_signals: per-sign-in observations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    fingerprint     TEXT NOT NULL,
    platform        TEXT NOT NULL DEFAULT 'unknown',
    user_agent      TEXT NOT NULL DEFAULT '',
    state           TEXT NOT NULL DEFAULT 'unverified'
                    CHECK (state IN ('unverified','trusted','flagged','revoked')),
    last_ip_country TEXT NOT NULL DEFAULT '',
    risk_score      INT  NOT NULL DEFAULT 50 CHECK (risk_score BETWEEN 0 AND 100),
    first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, fingerprint)
);

CREATE INDEX devices_user_idx ON devices (user_id);
CREATE INDEX devices_fingerprint_idx ON devices (fingerprint);

CREATE TABLE device_signals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id   UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    ip_country  TEXT NOT NULL DEFAULT '',
    observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX device_signals_device_idx ON device_signals (device_id, observed_at DESC);
