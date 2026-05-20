// Package store is the notification-auth-service DAO.
package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a challenge lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// CreateChallenge opens a step-up challenge. Returns the challenge id plus the
// raw approval token (delivered out-of-band in production, returned for dev).
func (p *Postgres) CreateChallenge(ctx context.Context, userID uuid.UUID, action string, ttl time.Duration) (id uuid.UUID, token string, err error) {
	if ttl <= 0 {
		ttl = 2 * time.Minute
	}
	token = newToken()
	h := sha256.Sum256([]byte(token))
	err = p.pool.QueryRow(ctx,
		`INSERT INTO challenges (user_id, action, token_hash, expires_at)
		 VALUES ($1, $2, $3, now() + $4::interval) RETURNING id`,
		userID, action, h[:], fmt.Sprintf("%d seconds", int(ttl.Seconds())),
	).Scan(&id)
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("create challenge: %w", err)
	}
	return id, token, nil
}

// Verify checks the approval token against a pending challenge and resolves it.
// Returns the resulting state: approved | denied | expired | unknown.
func (p *Postgres) Verify(ctx context.Context, id uuid.UUID, token string) (string, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var tokenHash []byte
	var state string
	var expiresAt time.Time
	err = tx.QueryRow(ctx,
		`SELECT token_hash, state, expires_at FROM challenges WHERE id = $1`, id,
	).Scan(&tokenHash, &state, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	if err != nil {
		return "", fmt.Errorf("load challenge: %w", err)
	}
	if state != "pending" {
		return state, nil
	}
	if time.Now().After(expiresAt) {
		_, _ = tx.Exec(ctx, `UPDATE challenges SET state = 'expired', resolved_at = now() WHERE id = $1`, id)
		_ = tx.Commit(ctx)
		return "expired", nil
	}

	supplied := sha256.Sum256([]byte(token))
	if !constantTimeEqual(tokenHash, supplied[:]) {
		_, _ = tx.Exec(ctx, `UPDATE challenges SET state = 'denied', resolved_at = now() WHERE id = $1`, id)
		_ = tx.Commit(ctx)
		return "denied", nil
	}
	if _, err := tx.Exec(ctx,
		`UPDATE challenges SET state = 'approved', resolved_at = now() WHERE id = $1`, id); err != nil {
		return "", fmt.Errorf("approve: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return "", err
	}
	return "approved", nil
}

// Cancel marks a pending challenge cancelled.
func (p *Postgres) Cancel(ctx context.Context, id uuid.UUID) error {
	tag, err := p.pool.Exec(ctx,
		`UPDATE challenges SET state = 'cancelled', resolved_at = now()
		 WHERE id = $1 AND state = 'pending'`, id)
	if err != nil {
		return fmt.Errorf("cancel: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func newToken() string {
	var buf [24]byte
	_, _ = rand.Read(buf[:])
	return base64.RawURLEncoding.EncodeToString(buf[:])
}

func constantTimeEqual(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	var diff byte
	for i := range a {
		diff |= a[i] ^ b[i]
	}
	return diff == 0
}
