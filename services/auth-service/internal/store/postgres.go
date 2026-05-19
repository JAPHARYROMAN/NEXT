// Package store holds the auth-service data-access layer.
//
// Postgres is the source of truth for users, credentials, sessions, refresh tokens.
// Redis carries ephemeral state (rate limits, hot session cache).
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

// ErrNotFound is returned when a lookup doesn't match.
var ErrNotFound = errors.New("not found")

// Postgres is the auth-service Postgres DAO.
type Postgres struct {
	pool *pgxpool.Pool
}

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by readyz. Caller controls the deadline; no inner timeout, since
// a cold pool can take longer than a steady-state ping on first use.
func (p *Postgres) Ping(ctx context.Context) error {
	return p.pool.Ping(ctx)
}

// RegisterUser inserts a fresh user. If id == uuid.Nil, Postgres mints one
// via the DEFAULT. Returns the persisted ID and ErrAlreadyExists if id collides.
//
// Auth-service does NOT persist the handle long-term — that's profile-service's
// concern. The handle is passed straight through to the registration event so
// profile-service can materialize a profile.
func (p *Postgres) RegisterUser(ctx context.Context, id uuid.UUID, handle string) (uuid.UUID, error) {
	var out uuid.UUID
	var err error
	if id == uuid.Nil {
		err = p.pool.QueryRow(ctx,
			`INSERT INTO users (handle) VALUES ($1) RETURNING id`, handle,
		).Scan(&out)
	} else {
		err = p.pool.QueryRow(ctx,
			`INSERT INTO users (id, handle) VALUES ($1, $2) RETURNING id`, id, handle,
		).Scan(&out)
	}
	if err != nil {
		return uuid.Nil, fmt.Errorf("register user: %w", err)
	}
	return out, nil
}

// Session models a row of the sessions table.
type Session struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	FamilyID   uuid.UUID
	DeviceID   string
	Method     string
	IPCountry  string
	UserAgent  string
	CreatedAt  time.Time
	ExpiresAt  time.Time
	RevokedAt  *time.Time
}

// CreateSession inserts a new session.
func (p *Postgres) CreateSession(ctx context.Context, s Session) (Session, error) {
	row := p.pool.QueryRow(ctx, `
		INSERT INTO sessions (id, user_id, family_id, device_id, method, ip_country, user_agent, expires_at)
		VALUES (COALESCE($1, gen_random_uuid()), $2, $3, NULLIF($4,''), $5, NULLIF($6,''), NULLIF($7,''), $8)
		RETURNING id, created_at`,
		nullUUID(s.ID), s.UserID, s.FamilyID, s.DeviceID, s.Method, s.IPCountry, s.UserAgent, s.ExpiresAt,
	)
	if err := row.Scan(&s.ID, &s.CreatedAt); err != nil {
		return Session{}, fmt.Errorf("insert session: %w", err)
	}
	return s, nil
}

// GetSession returns an active session by ID, or ErrNotFound.
func (p *Postgres) GetSession(ctx context.Context, id uuid.UUID) (Session, error) {
	const q = `
		SELECT id, user_id, family_id, COALESCE(device_id,''), method, COALESCE(ip_country,''),
		       COALESCE(user_agent,''), created_at, expires_at, revoked_at
		FROM sessions WHERE id = $1`
	var s Session
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&s.ID, &s.UserID, &s.FamilyID, &s.DeviceID, &s.Method, &s.IPCountry,
		&s.UserAgent, &s.CreatedAt, &s.ExpiresAt, &s.RevokedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("get session: %w", err)
	}
	return s, nil
}

// RevokeSession marks a session as revoked.
func (p *Postgres) RevokeSession(ctx context.Context, id uuid.UUID) error {
	tag, err := p.pool.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`, id)
	if err != nil {
		return fmt.Errorf("revoke session: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// RevokeFamily marks every session and refresh token in a family as revoked.
// Used when refresh-token theft is detected.
func (p *Postgres) RevokeFamily(ctx context.Context, familyID uuid.UUID) error {
	tx, err := p.pool.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx,
		`UPDATE sessions SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`,
		familyID); err != nil {
		return fmt.Errorf("revoke family sessions: %w", err)
	}
	if _, err := tx.Exec(ctx,
		`UPDATE refresh_tokens SET used_at = now() WHERE family_id = $1 AND used_at IS NULL`,
		familyID); err != nil {
		return fmt.Errorf("revoke family tokens: %w", err)
	}
	return tx.Commit(ctx)
}

// nullUUID converts the uuid.Nil sentinel to nil so the DB DEFAULT fires.
func nullUUID(id uuid.UUID) any {
	if id == uuid.Nil {
		return nil
	}
	return id
}
