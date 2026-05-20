// Package store is the device-graph-service DAO.
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

// ErrNotFound is returned when a device lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Device is the in-memory shape.
type Device struct {
	ID            uuid.UUID
	UserID        uuid.UUID
	Fingerprint   string
	Platform      string
	UserAgent     string
	State         string
	LastIPCountry string
	RiskScore     int
	FirstSeenAt   time.Time
	LastSeenAt    time.Time
}

// Upsert registers a device or refreshes an existing one (matched on user+fingerprint).
// Returns the device plus how many distinct countries this device has signed in from —
// the caller uses that for risk scoring.
func (p *Postgres) Upsert(ctx context.Context, d Device) (Device, int, error) {
	const q = `
		INSERT INTO devices (user_id, fingerprint, platform, user_agent, last_ip_country)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id, fingerprint) DO UPDATE
		  SET last_seen_at = now(), last_ip_country = EXCLUDED.last_ip_country,
		      user_agent = EXCLUDED.user_agent
		RETURNING id, state, risk_score, first_seen_at, last_seen_at`
	err := p.pool.QueryRow(ctx, q,
		d.UserID, d.Fingerprint, d.Platform, d.UserAgent, d.LastIPCountry,
	).Scan(&d.ID, &d.State, &d.RiskScore, &d.FirstSeenAt, &d.LastSeenAt)
	if err != nil {
		return Device{}, 0, fmt.Errorf("upsert device: %w", err)
	}

	if d.LastIPCountry != "" {
		if _, err := p.pool.Exec(ctx,
			`INSERT INTO device_signals (device_id, ip_country) VALUES ($1, $2)`,
			d.ID, d.LastIPCountry); err != nil {
			return Device{}, 0, fmt.Errorf("insert signal: %w", err)
		}
	}

	var countries int
	if err := p.pool.QueryRow(ctx,
		`SELECT COUNT(DISTINCT ip_country) FROM device_signals WHERE device_id = $1 AND ip_country <> ''`,
		d.ID).Scan(&countries); err != nil {
		return Device{}, 0, fmt.Errorf("count countries: %w", err)
	}
	return d, countries, nil
}

// Get returns a device by ID.
func (p *Postgres) Get(ctx context.Context, id uuid.UUID) (Device, error) {
	const q = `
		SELECT id, user_id, fingerprint, platform, user_agent, state, last_ip_country,
		       risk_score, first_seen_at, last_seen_at
		FROM devices WHERE id = $1`
	var d Device
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&d.ID, &d.UserID, &d.Fingerprint, &d.Platform, &d.UserAgent, &d.State,
		&d.LastIPCountry, &d.RiskScore, &d.FirstSeenAt, &d.LastSeenAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Device{}, ErrNotFound
	}
	if err != nil {
		return Device{}, fmt.Errorf("get device: %w", err)
	}
	return d, nil
}

// SetRiskScore persists a freshly computed risk score.
func (p *Postgres) SetRiskScore(ctx context.Context, id uuid.UUID, score int) error {
	_, err := p.pool.Exec(ctx, `UPDATE devices SET risk_score = $2 WHERE id = $1`, id, score)
	return err
}

// List returns all devices for a user.
func (p *Postgres) List(ctx context.Context, userID uuid.UUID) ([]Device, error) {
	const q = `
		SELECT id, user_id, fingerprint, platform, user_agent, state, last_ip_country,
		       risk_score, first_seen_at, last_seen_at
		FROM devices WHERE user_id = $1 ORDER BY last_seen_at DESC`
	rows, err := p.pool.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("list devices: %w", err)
	}
	defer rows.Close()
	out := []Device{}
	for rows.Next() {
		var d Device
		if err := rows.Scan(&d.ID, &d.UserID, &d.Fingerprint, &d.Platform, &d.UserAgent,
			&d.State, &d.LastIPCountry, &d.RiskScore, &d.FirstSeenAt, &d.LastSeenAt); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

// Revoke marks a device revoked.
func (p *Postgres) Revoke(ctx context.Context, id uuid.UUID) error {
	tag, err := p.pool.Exec(ctx, `UPDATE devices SET state = 'revoked' WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("revoke device: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
