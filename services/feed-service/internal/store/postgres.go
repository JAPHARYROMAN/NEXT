// Package store is the feed-service persistence layer: session state (seen set
// + cross-page fatigue), experiment assignments, and the impression log.
package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Postgres is the feed datastore.
type Postgres struct {
	pool *pgxpool.Pool
}

// NewPostgres wraps a pgx pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres {
	return &Postgres{pool: pool}
}

// Ping checks datastore reachability.
func (p *Postgres) Ping(ctx context.Context) error {
	return p.pool.Ping(ctx)
}

// Session is the persisted state of a feed session.
type Session struct {
	SessionID string
	UserID    string
	Surface   string
	PageCount int
	Fatigue   float64
	Seen      map[string]bool
}

// LoadSession returns a session and its seen-content set. A session that has
// never been persisted comes back zero-valued with an empty seen set — the
// caller treats that as a fresh session, not an error.
func (p *Postgres) LoadSession(ctx context.Context, sessionID string) (Session, error) {
	s := Session{SessionID: sessionID, Seen: map[string]bool{}}
	err := p.pool.QueryRow(ctx, `
		SELECT user_id, surface, page_count, fatigue
		FROM feed_sessions WHERE session_id = $1`, sessionID).
		Scan(&s.UserID, &s.Surface, &s.PageCount, &s.Fatigue)
	if errors.Is(err, pgx.ErrNoRows) {
		return s, nil
	}
	if err != nil {
		return Session{}, err
	}

	rows, err := p.pool.Query(ctx, `SELECT content_id FROM feed_seen WHERE session_id = $1`, sessionID)
	if err != nil {
		return Session{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var cid string
		if err := rows.Scan(&cid); err != nil {
			return Session{}, err
		}
		s.Seen[cid] = true
	}
	return s, rows.Err()
}

// SaveSession upserts the session row and records the content served this page
// into the seen set.
func (p *Postgres) SaveSession(ctx context.Context, s Session, servedContentIDs []string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO feed_sessions (session_id, user_id, surface, page_count, fatigue, updated_at)
		VALUES ($1,$2,$3,$4,$5,now())
		ON CONFLICT (session_id) DO UPDATE
			SET page_count = EXCLUDED.page_count,
			    fatigue    = EXCLUDED.fatigue,
			    updated_at = now()`,
		s.SessionID, s.UserID, s.Surface, s.PageCount, s.Fatigue)
	if err != nil {
		return err
	}
	for _, cid := range servedContentIDs {
		if _, err = tx.Exec(ctx, `
			INSERT INTO feed_seen (session_id, content_id) VALUES ($1,$2)
			ON CONFLICT DO NOTHING`, s.SessionID, cid); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

// RecordImpression logs an impression and marks the content seen. It upserts a
// minimal session row first so the seen-set foreign key always resolves.
func (p *Postgres) RecordImpression(ctx context.Context, sessionID, userID, contentID, kind string, dwellMs int64) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err = tx.Exec(ctx, `
		INSERT INTO feed_sessions (session_id, user_id, surface) VALUES ($1,$2,'')
		ON CONFLICT DO NOTHING`, sessionID, userID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO feed_seen (session_id, content_id) VALUES ($1,$2)
		ON CONFLICT DO NOTHING`, sessionID, contentID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `
		INSERT INTO feed_impressions (session_id, content_id, kind, dwell_ms)
		VALUES ($1,$2,$3,$4)`, sessionID, contentID, kind, dwellMs); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// GetAssignment returns a stored experiment arm, if one exists.
func (p *Postgres) GetAssignment(ctx context.Context, userID, experimentKey string) (string, bool, error) {
	var arm string
	err := p.pool.QueryRow(ctx, `
		SELECT arm FROM experiment_assignments
		WHERE user_id = $1 AND experiment_key = $2`, userID, experimentKey).Scan(&arm)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return arm, true, nil
}

// SaveAssignment persists an experiment arm assignment. It is idempotent — a
// concurrent assignment for the same (user, experiment) keeps the first.
func (p *Postgres) SaveAssignment(ctx context.Context, userID, experimentKey, arm string) error {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO experiment_assignments (user_id, experiment_key, arm)
		VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, userID, experimentKey, arm)
	return err
}
