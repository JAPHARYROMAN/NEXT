// Package store is the session-service DAO.
//
// Sessions live in Postgres; refresh tokens are SHA-256 hashed at rest so a
// leaked snapshot can't be replayed.
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

var (
	ErrNotFound       = errors.New("not found")
	ErrTokenReused    = errors.New("refresh token reused — theft")
	ErrTokenExpired   = errors.New("refresh token expired")
	ErrSessionExpired = errors.New("session expired")
	ErrSessionRevoked = errors.New("session revoked")
)

type Postgres struct{ pool *pgxpool.Pool }

func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

type Session struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	FamilyID     uuid.UUID
	Method       string
	DeviceID     string
	IPCountry    string
	UserAgent    string
	StartedAt    time.Time
	LastActiveAt time.Time
	ExpiresAt    time.Time
	RevokedAt    *time.Time
}

// Create inserts a session + first refresh token in one transaction.
// Returns the raw refresh token (only ever shown to the caller once).
func (p *Postgres) Create(ctx context.Context, userID uuid.UUID, method, deviceID, ipCountry, ua string, ttl time.Duration) (Session, string, error) {
	if ttl <= 0 {
		ttl = 7 * 24 * time.Hour
	}
	familyID := uuid.New()
	now := time.Now().UTC()
	expires := now.Add(ttl)

	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Session{}, "", fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var sess Session
	sess.UserID = userID
	sess.FamilyID = familyID
	sess.Method = method
	sess.DeviceID = deviceID
	sess.IPCountry = ipCountry
	sess.UserAgent = ua
	sess.ExpiresAt = expires

	err = tx.QueryRow(ctx, `
		INSERT INTO sessions (user_id, family_id, method, device_id, ip_country, user_agent, expires_at)
		VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''), NULLIF($6,''), $7)
		RETURNING id, started_at, last_active_at`,
		userID, familyID, method, deviceID, ipCountry, ua, expires,
	).Scan(&sess.ID, &sess.StartedAt, &sess.LastActiveAt)
	if err != nil {
		return Session{}, "", fmt.Errorf("insert session: %w", err)
	}

	raw, hash, err := newRefreshToken()
	if err != nil {
		return Session{}, "", err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO refresh_tokens (token_hash, session_id, family_id, expires_at)
		VALUES ($1, $2, $3, $4)`,
		hash[:], sess.ID, familyID, expires,
	); err != nil {
		return Session{}, "", fmt.Errorf("insert refresh: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return Session{}, "", err
	}
	return sess, raw, nil
}

// Get returns the session by id, or ErrNotFound.
func (p *Postgres) Get(ctx context.Context, id uuid.UUID) (Session, error) {
	const q = `
		SELECT id, user_id, family_id, method, COALESCE(device_id,''), COALESCE(ip_country,''),
		       COALESCE(user_agent,''), started_at, last_active_at, expires_at, revoked_at
		FROM sessions WHERE id = $1`
	var s Session
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&s.ID, &s.UserID, &s.FamilyID, &s.Method, &s.DeviceID, &s.IPCountry,
		&s.UserAgent, &s.StartedAt, &s.LastActiveAt, &s.ExpiresAt, &s.RevokedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("get session: %w", err)
	}
	return s, nil
}

// ListActive returns every unrevoked, unexpired session for a user.
func (p *Postgres) ListActive(ctx context.Context, userID uuid.UUID) ([]Session, error) {
	const q = `
		SELECT id, user_id, family_id, method, COALESCE(device_id,''), COALESCE(ip_country,''),
		       COALESCE(user_agent,''), started_at, last_active_at, expires_at, revoked_at
		FROM sessions
		WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()
		ORDER BY last_active_at DESC`
	rows, err := p.pool.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}
	defer rows.Close()
	out := make([]Session, 0, 4)
	for rows.Next() {
		var s Session
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.FamilyID, &s.Method, &s.DeviceID, &s.IPCountry,
			&s.UserAgent, &s.StartedAt, &s.LastActiveAt, &s.ExpiresAt, &s.RevokedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

// Revoke marks the session as revoked.
func (p *Postgres) Revoke(ctx context.Context, id uuid.UUID) error {
	tag, err := p.pool.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`, id)
	if err != nil {
		return fmt.Errorf("revoke: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Refresh rotates a refresh token. Returns the new session + raw token.
// On reuse of a used token, the entire family is revoked and ErrTokenReused is returned.
func (p *Postgres) Refresh(ctx context.Context, rawToken string) (Session, string, bool, error) {
	hash := sha256.Sum256([]byte(rawToken))

	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return Session{}, "", false, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var (
		sessionID, familyID uuid.UUID
		usedAt              *time.Time
		expiresAt           time.Time
	)
	err = tx.QueryRow(ctx,
		`SELECT session_id, family_id, used_at, expires_at FROM refresh_tokens WHERE token_hash = $1`,
		hash[:],
	).Scan(&sessionID, &familyID, &usedAt, &expiresAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Session{}, "", false, ErrNotFound
	}
	if err != nil {
		return Session{}, "", false, fmt.Errorf("lookup refresh: %w", err)
	}
	if usedAt != nil {
		// Theft! Revoke the entire family.
		if _, err := tx.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`, familyID); err != nil {
			return Session{}, "", true, err
		}
		if err := tx.Commit(ctx); err != nil {
			return Session{}, "", true, err
		}
		return Session{}, "", true, ErrTokenReused
	}
	if time.Now().After(expiresAt) {
		return Session{}, "", false, ErrTokenExpired
	}

	if _, err := tx.Exec(ctx, `UPDATE refresh_tokens SET used_at = now() WHERE token_hash = $1`, hash[:]); err != nil {
		return Session{}, "", false, fmt.Errorf("mark used: %w", err)
	}

	newRaw, newHash, err := newRefreshToken()
	if err != nil {
		return Session{}, "", false, err
	}
	if _, err := tx.Exec(ctx,
		`INSERT INTO refresh_tokens (token_hash, session_id, family_id, expires_at) VALUES ($1, $2, $3, $4)`,
		newHash[:], sessionID, familyID, expiresAt,
	); err != nil {
		return Session{}, "", false, fmt.Errorf("insert new refresh: %w", err)
	}

	if _, err := tx.Exec(ctx,
		`UPDATE sessions SET last_active_at = now() WHERE id = $1`, sessionID,
	); err != nil {
		return Session{}, "", false, err
	}

	var s Session
	err = tx.QueryRow(ctx, `
		SELECT id, user_id, family_id, method, COALESCE(device_id,''), COALESCE(ip_country,''),
		       COALESCE(user_agent,''), started_at, last_active_at, expires_at, revoked_at
		FROM sessions WHERE id = $1`, sessionID,
	).Scan(
		&s.ID, &s.UserID, &s.FamilyID, &s.Method, &s.DeviceID, &s.IPCountry,
		&s.UserAgent, &s.StartedAt, &s.LastActiveAt, &s.ExpiresAt, &s.RevokedAt,
	)
	if err != nil {
		return Session{}, "", false, err
	}

	if err := tx.Commit(ctx); err != nil {
		return Session{}, "", false, err
	}
	return s, newRaw, false, nil
}

// ---- helpers ----

// newRefreshToken returns the (raw, sha256) pair. Raw is base64url-encoded
// 32 random bytes — 43 chars, no padding.
func newRefreshToken() (raw string, hash [32]byte, err error) {
	var buf [32]byte
	if _, err = rand.Read(buf[:]); err != nil {
		return "", [32]byte{}, err
	}
	raw = base64.RawURLEncoding.EncodeToString(buf[:])
	hash = sha256.Sum256([]byte(raw))
	return raw, hash, nil
}
