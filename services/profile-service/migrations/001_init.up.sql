-- 001 — initial profile-service schema.
-- Owns the per-user profile + the social graph (follow, mute, block).
-- The auth-service owns user existence; this table mirrors user_id with no FK
-- because the two databases are independent (per [ADR 0017]).

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE profiles (
    user_id       UUID PRIMARY KEY,
    handle        CITEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL DEFAULT '',
    bio           TEXT NOT NULL DEFAULT '',
    tier          TEXT NOT NULL DEFAULT 'authenticated'
                  CHECK (tier IN ('authenticated','creator','partner','staff')),
    followers     BIGINT NOT NULL DEFAULT 0 CHECK (followers >= 0),
    following     BIGINT NOT NULL DEFAULT 0 CHECK (following >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX profiles_handle_active_idx ON profiles (handle) WHERE deleted_at IS NULL;

-- Follow edges. follower → followee. Idempotent on the pair.
CREATE TABLE follows (
    follower_id  UUID NOT NULL,
    followee_id  UUID NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);

CREATE INDEX follows_followee_idx ON follows (followee_id, created_at DESC);
CREATE INDEX follows_follower_idx ON follows (follower_id, created_at DESC);

-- Mutes: follower keeps the relationship but hides the followee's content.
CREATE TABLE mutes (
    user_id      UUID NOT NULL,
    muted_id     UUID NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, muted_id),
    CHECK (user_id <> muted_id)
);

-- Blocks: hard barrier in both directions.
CREATE TABLE blocks (
    user_id      UUID NOT NULL,
    blocked_id   UUID NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, blocked_id),
    CHECK (user_id <> blocked_id)
);

CREATE INDEX blocks_blocked_idx ON blocks (blocked_id);

-- Counter maintenance. Always-on triggers keep the materialized counts
-- in `profiles` consistent. (Phase 4 will pre-cache the hot fanouts in Redis
-- for the very high-follower creators; this is the source of truth.)
CREATE OR REPLACE FUNCTION follows_after_insert() RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET followers = followers + 1 WHERE user_id = NEW.followee_id;
    UPDATE profiles SET following = following + 1 WHERE user_id = NEW.follower_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION follows_after_delete() RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET followers = GREATEST(followers - 1, 0) WHERE user_id = OLD.followee_id;
    UPDATE profiles SET following = GREATEST(following - 1, 0) WHERE user_id = OLD.follower_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follows_inc AFTER INSERT ON follows
    FOR EACH ROW EXECUTE FUNCTION follows_after_insert();
CREATE TRIGGER follows_dec AFTER DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION follows_after_delete();

-- updated_at touch.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
