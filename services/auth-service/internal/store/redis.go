package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Redis wraps the auth-service Redis client.
type Redis struct {
	c redis.UniversalClient
}

// NewRedis wraps a client.
func NewRedis(c redis.UniversalClient) *Redis { return &Redis{c: c} }

// Ping is used by readyz. Caller controls the deadline.
func (r *Redis) Ping(ctx context.Context) error {
	return r.c.Ping(ctx).Err()
}

// AllowLogin applies a fixed-window rate limit for login attempts.
// Returns (true, retryAfter) when the request is allowed; otherwise (false, retryAfter).
func (r *Redis) AllowLogin(ctx context.Context, identity string, limit int, window time.Duration) (bool, time.Duration, error) {
	key := fmt.Sprintf("auth:rl:login:%s", identity)
	pipe := r.c.TxPipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, window)
	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, fmt.Errorf("rate limit: %w", err)
	}
	count := incr.Val()
	if count <= int64(limit) {
		return true, 0, nil
	}
	ttl, err := r.c.TTL(ctx, key).Result()
	if err != nil {
		return false, window, nil
	}
	return false, ttl, nil
}

// MarkSessionRevoked publishes a fast-path "this session is revoked" marker.
// Verifiers consult this before accepting a token whose JWT signature is still valid.
func (r *Redis) MarkSessionRevoked(ctx context.Context, sessionID string, ttl time.Duration) error {
	key := fmt.Sprintf("auth:revoked:%s", sessionID)
	if err := r.c.Set(ctx, key, "1", ttl).Err(); err != nil {
		return fmt.Errorf("mark revoked: %w", err)
	}
	return nil
}

// IsSessionRevoked returns true when the session has been explicitly revoked.
func (r *Redis) IsSessionRevoked(ctx context.Context, sessionID string) (bool, error) {
	key := fmt.Sprintf("auth:revoked:%s", sessionID)
	v, err := r.c.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check revoked: %w", err)
	}
	return v == "1", nil
}
