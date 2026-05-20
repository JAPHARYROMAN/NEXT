// Package store is the creator-identity-service DAO.
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

// ErrNotFound is returned when a creator lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Creator is the in-memory shape.
type Creator struct {
	UserID      uuid.UUID
	DisplayName string
	KYCState    string
	PayoutReady bool
	UpgradedAt  time.Time
}

// Upgrade creates (or returns the existing) creator record for a user.
func (p *Postgres) Upgrade(ctx context.Context, userID uuid.UUID, displayName string) (Creator, error) {
	const q = `
		INSERT INTO creators (user_id, display_name) VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE
		  SET display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), creators.display_name)
		RETURNING user_id, display_name, kyc_state, payout_ready, upgraded_at`
	var c Creator
	err := p.pool.QueryRow(ctx, q, userID, displayName).Scan(
		&c.UserID, &c.DisplayName, &c.KYCState, &c.PayoutReady, &c.UpgradedAt,
	)
	if err != nil {
		return Creator{}, fmt.Errorf("upgrade: %w", err)
	}
	return c, nil
}

// Get returns a creator record.
func (p *Postgres) Get(ctx context.Context, userID uuid.UUID) (Creator, error) {
	const q = `SELECT user_id, display_name, kyc_state, payout_ready, upgraded_at
	           FROM creators WHERE user_id = $1`
	var c Creator
	err := p.pool.QueryRow(ctx, q, userID).Scan(
		&c.UserID, &c.DisplayName, &c.KYCState, &c.PayoutReady, &c.UpgradedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Creator{}, ErrNotFound
	}
	if err != nil {
		return Creator{}, fmt.Errorf("get creator: %w", err)
	}
	return c, nil
}

// StartVerification opens a KYC workflow and moves the creator to `pending`.
func (p *Postgres) StartVerification(ctx context.Context, userID uuid.UUID, kind string) (uuid.UUID, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return uuid.Nil, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var exists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM creators WHERE user_id = $1)`, userID).Scan(&exists); err != nil {
		return uuid.Nil, err
	}
	if !exists {
		return uuid.Nil, ErrNotFound
	}

	var workflowID uuid.UUID
	if err := tx.QueryRow(ctx,
		`INSERT INTO kyc_workflows (user_id, kind) VALUES ($1, $2) RETURNING id`,
		userID, kind).Scan(&workflowID); err != nil {
		return uuid.Nil, fmt.Errorf("insert workflow: %w", err)
	}
	if _, err := tx.Exec(ctx,
		`UPDATE creators SET kyc_state = 'pending' WHERE user_id = $1 AND kyc_state = 'none'`,
		userID); err != nil {
		return uuid.Nil, fmt.Errorf("set pending: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}
	return workflowID, nil
}

// VerificationStatus returns the creator's kyc_state.
func (p *Postgres) VerificationStatus(ctx context.Context, userID uuid.UUID) (string, error) {
	var state string
	err := p.pool.QueryRow(ctx, `SELECT kyc_state FROM creators WHERE user_id = $1`, userID).Scan(&state)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	if err != nil {
		return "", fmt.Errorf("verification status: %w", err)
	}
	return state, nil
}
