// Package store is the account-recovery-service DAO.
package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base32"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a flow lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// IssueCodes generates `count` single-use recovery codes, stores their hashes,
// and returns the plaintext exactly once. Any prior unused codes are dropped.
func (p *Postgres) IssueCodes(ctx context.Context, userID uuid.UUID, count int) ([]string, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `DELETE FROM recovery_codes WHERE user_id = $1 AND used_at IS NULL`, userID); err != nil {
		return nil, fmt.Errorf("clear old codes: %w", err)
	}
	codes := make([]string, count)
	for i := range codes {
		code := newCode()
		codes[i] = code
		h := hashCode(code)
		if _, err := tx.Exec(ctx,
			`INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)`, userID, h[:]); err != nil {
			return nil, fmt.Errorf("insert code: %w", err)
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return codes, nil
}

// StartFlow opens a recovery flow. For recovery_code flows the challenge is the
// code itself; for email/trusted_contact a one-time challenge is generated and
// would be delivered out-of-band (returned here for local dev).
func (p *Postgres) StartFlow(ctx context.Context, userID uuid.UUID, kind string) (flowID uuid.UUID, channel string, err error) {
	var challengeHashColumn any // nil for recovery_code; set otherwise.
	channel = kind
	if kind != "recovery_code" {
		challenge := newCode()
		h := hashCode(challenge)
		challengeHashColumn = h[:]
		channel = kind + ":" + challenge // dev convenience; prod delivers OOB
	}
	err = p.pool.QueryRow(ctx,
		`INSERT INTO recovery_flows (user_id, kind, challenge_hash) VALUES ($1, $2, $3) RETURNING id`,
		userID, kind, challengeHashColumn,
	).Scan(&flowID)
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("start flow: %w", err)
	}
	return flowID, channel, nil
}

// VerifyChallenge checks the supplied challenge against the flow. On success the
// flow moves to `completed`. For recovery_code flows the challenge is matched
// against the user's unused recovery codes.
func (p *Postgres) VerifyChallenge(ctx context.Context, flowID uuid.UUID, challenge string) (completed bool, state string, err error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return false, "", fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var userID uuid.UUID
	var kind string
	var challengeHash []byte
	var expiresAt time.Time
	var curState string
	err = tx.QueryRow(ctx,
		`SELECT user_id, kind, challenge_hash, state, expires_at FROM recovery_flows WHERE id = $1`,
		flowID,
	).Scan(&userID, &kind, &challengeHash, &curState, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, "", ErrNotFound
	}
	if err != nil {
		return false, "", fmt.Errorf("load flow: %w", err)
	}
	if curState == "completed" {
		return true, "completed", nil
	}
	if time.Now().After(expiresAt) {
		_, _ = tx.Exec(ctx, `UPDATE recovery_flows SET state = 'expired' WHERE id = $1`, flowID)
		_ = tx.Commit(ctx)
		return false, "expired", nil
	}

	supplied := hashCode(challenge)
	ok := false
	if kind == "recovery_code" {
		tag, e := tx.Exec(ctx,
			`UPDATE recovery_codes SET used_at = now()
			 WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL`,
			userID, supplied[:])
		if e != nil {
			return false, "", fmt.Errorf("consume code: %w", e)
		}
		ok = tag.RowsAffected() == 1
	} else {
		ok = challengeHash != nil && constantTimeEqual(challengeHash, supplied[:])
	}

	if !ok {
		_, _ = tx.Exec(ctx, `UPDATE recovery_flows SET attempts = attempts + 1 WHERE id = $1`, flowID)
		_ = tx.Commit(ctx)
		return false, "failed", nil
	}
	if _, err := tx.Exec(ctx, `UPDATE recovery_flows SET state = 'completed' WHERE id = $1`, flowID); err != nil {
		return false, "", fmt.Errorf("complete flow: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return false, "", err
	}
	return true, "completed", nil
}

// ----- helpers -------------------------------------------------------------

// newCode returns a human-friendly 10-char base32 recovery code.
func newCode() string {
	var buf [8]byte
	_, _ = rand.Read(buf[:])
	s := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(buf[:])
	return strings.ToLower(s[:10])
}

func hashCode(code string) [32]byte {
	return sha256.Sum256([]byte(strings.ToLower(strings.TrimSpace(code))))
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
