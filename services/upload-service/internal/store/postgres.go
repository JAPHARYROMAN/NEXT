// Package store is the upload-service DAO for session + part metadata.
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

// ErrNotFound is returned when a session lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Session is the in-memory shape.
type Session struct {
	ID             uuid.UUID
	CreatorID      uuid.UUID
	ContentType    string
	Filename       string
	TotalBytes     int64
	CommittedBytes int64
	State          string
	ObjectKey      string
	CreatedAt      time.Time
}

// CreateSession opens a new upload session.
func (p *Postgres) CreateSession(ctx context.Context, s Session) (Session, error) {
	const q = `
		INSERT INTO upload_sessions (creator_id, content_type, filename, total_bytes)
		VALUES ($1, $2, $3, $4)
		RETURNING id, committed_bytes, state, object_key, created_at`
	err := p.pool.QueryRow(ctx, q, s.CreatorID, s.ContentType, s.Filename, s.TotalBytes).Scan(
		&s.ID, &s.CommittedBytes, &s.State, &s.ObjectKey, &s.CreatedAt,
	)
	if err != nil {
		return Session{}, fmt.Errorf("create session: %w", err)
	}
	return s, nil
}

// GetSession reads a session by ID.
func (p *Postgres) GetSession(ctx context.Context, id uuid.UUID) (Session, error) {
	const q = `
		SELECT id, creator_id, content_type, filename, total_bytes, committed_bytes,
		       state, object_key, created_at
		FROM upload_sessions WHERE id = $1`
	var s Session
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&s.ID, &s.CreatorID, &s.ContentType, &s.Filename, &s.TotalBytes,
		&s.CommittedBytes, &s.State, &s.ObjectKey, &s.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("get session: %w", err)
	}
	return s, nil
}

// RecordPart inserts a part row (idempotent on the offset) and recomputes the
// highest contiguous committed offset. Returns the new committed_bytes.
func (p *Postgres) RecordPart(ctx context.Context, sessionID uuid.UUID, offset, size int64) (int64, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx,
		`INSERT INTO upload_parts (session_id, part_offset, part_size) VALUES ($1, $2, $3)
		 ON CONFLICT (session_id, part_offset) DO UPDATE SET part_size = EXCLUDED.part_size`,
		sessionID, offset, size); err != nil {
		return 0, fmt.Errorf("record part: %w", err)
	}

	// Walk parts in offset order; committed = end of the longest run starting at 0.
	rows, err := tx.Query(ctx,
		`SELECT part_offset, part_size FROM upload_parts WHERE session_id = $1 ORDER BY part_offset`,
		sessionID)
	if err != nil {
		return 0, fmt.Errorf("scan parts: %w", err)
	}
	var committed int64
	for rows.Next() {
		var off, sz int64
		if err := rows.Scan(&off, &sz); err != nil {
			rows.Close()
			return 0, err
		}
		if off == committed {
			committed = off + sz
		} else if off > committed {
			break // gap — stop the contiguous run
		}
	}
	rows.Close()

	if _, err := tx.Exec(ctx,
		`UPDATE upload_sessions SET committed_bytes = $2, updated_at = now() WHERE id = $1`,
		sessionID, committed); err != nil {
		return 0, fmt.Errorf("update committed: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return 0, err
	}
	return committed, nil
}

// MarkCompleted records the finalized object key.
func (p *Postgres) MarkCompleted(ctx context.Context, sessionID uuid.UUID, objectKey string) error {
	tag, err := p.pool.Exec(ctx,
		`UPDATE upload_sessions SET state = 'completed', object_key = $2, updated_at = now()
		 WHERE id = $1 AND state IN ('open','finalizing')`,
		sessionID, objectKey)
	if err != nil {
		return fmt.Errorf("mark completed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
