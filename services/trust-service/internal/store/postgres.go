// Package store is the trust-service DAO.
package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DefaultScore is the neutral trust score for an account with no signals yet.
const DefaultScore = 0.5

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// TrustState is the in-memory shape returned to callers.
type TrustState struct {
	UserID        uuid.UUID
	Score         float64
	Verifications []string
	UpdatedAt     time.Time
}

// Get returns the trust state, defaulting to a neutral score for unknown users.
func (p *Postgres) Get(ctx context.Context, userID uuid.UUID) (TrustState, error) {
	st := TrustState{UserID: userID, Score: DefaultScore, UpdatedAt: time.Now().UTC()}

	err := p.pool.QueryRow(ctx,
		`SELECT score, updated_at FROM trust_scores WHERE user_id = $1`, userID,
	).Scan(&st.Score, &st.UpdatedAt)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return TrustState{}, fmt.Errorf("get score: %w", err)
	}

	rows, err := p.pool.Query(ctx,
		`SELECT kind FROM verifications WHERE user_id = $1 AND revoked_at IS NULL ORDER BY kind`, userID)
	if err != nil {
		return TrustState{}, fmt.Errorf("get verifications: %w", err)
	}
	defer rows.Close()
	st.Verifications = []string{}
	for rows.Next() {
		var k string
		if err := rows.Scan(&k); err != nil {
			return TrustState{}, err
		}
		st.Verifications = append(st.Verifications, k)
	}
	return st, rows.Err()
}

// GrantVerification adds a verification badge. A verified account also gets a
// score floor of 0.8 — verification is a strong positive signal.
func (p *Postgres) GrantVerification(ctx context.Context, userID, grantedBy uuid.UUID, kind, evidence string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `
		INSERT INTO verifications (user_id, kind, granted_by, evidence)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, kind) DO UPDATE SET revoked_at = NULL, granted_by = $3, evidence = $4`,
		userID, kind, grantedBy, evidence); err != nil {
		return fmt.Errorf("insert verification: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO trust_scores (user_id, score) VALUES ($1, 0.8)
		ON CONFLICT (user_id) DO UPDATE SET score = GREATEST(trust_scores.score, 0.8), updated_at = now()`,
		userID); err != nil {
		return fmt.Errorf("bump score: %w", err)
	}
	if _, err := tx.Exec(ctx,
		`INSERT INTO penalty_log (user_id, signal, delta, note) VALUES ($1, 'verification_grant', 0.3, $2)`,
		userID, kind); err != nil {
		return fmt.Errorf("log: %w", err)
	}
	return tx.Commit(ctx)
}

// RevokeVerification marks a verification as revoked.
func (p *Postgres) RevokeVerification(ctx context.Context, userID uuid.UUID, kind, reason string) error {
	tag, err := p.pool.Exec(ctx,
		`UPDATE verifications SET revoked_at = now() WHERE user_id = $1 AND kind = $2 AND revoked_at IS NULL`,
		userID, kind)
	if err != nil {
		return fmt.Errorf("revoke verification: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return errors.New("not found")
	}
	_, _ = p.pool.Exec(ctx,
		`INSERT INTO penalty_log (user_id, signal, delta, note) VALUES ($1, 'verification_revoke', -0.3, $2)`,
		userID, reason)
	return nil
}
