-- 001 — creator-identity-service schema.

CREATE TABLE creators (
    user_id      UUID PRIMARY KEY,
    display_name TEXT NOT NULL DEFAULT '',
    kyc_state    TEXT NOT NULL DEFAULT 'none'
                 CHECK (kyc_state IN ('none','pending','verified','rejected')),
    payout_ready BOOLEAN NOT NULL DEFAULT false,
    upgraded_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kyc_workflows (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES creators(user_id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    state       TEXT NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX kyc_workflows_user_idx ON kyc_workflows (user_id);
