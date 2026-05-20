-- 001 — access-control-service schema.
-- Roles are named scope-sets; role_bindings attach a role to a user.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    name        TEXT PRIMARY KEY,
    description TEXT NOT NULL DEFAULT '',
    scopes      TEXT[] NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_bindings (
    user_id    UUID NOT NULL,
    role       TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
    granted_by UUID NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role)
);

CREATE INDEX role_bindings_user_idx ON role_bindings (user_id);

-- Seed the built-in roles. Tier-default scopes are handled in code; these
-- roles are additive grants on top of the tier baseline.
INSERT INTO roles (name, description, scopes) VALUES
  ('moderator', 'Content moderation queue access', ARRAY['moderation:view','moderation:decide']),
  ('support',   'Read-only support tooling',       ARRAY['profile:read']),
  ('admin',     'Full administrative access',      ARRAY['admin:impersonate','admin:feature_flag','moderation:view','moderation:decide']);
