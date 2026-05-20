// Package store is the media-service DAO.
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

// ErrNotFound is returned when a video lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Rendition is one encoded variant of a video.
type Rendition struct {
	Rung        string
	Codec       string
	ObjectKey   string
	Bytes       int64
	Width       int32
	Height      int32
	BitrateKbps int32
}

// Video is the in-memory aggregate.
type Video struct {
	ID          uuid.UUID
	CreatorID   uuid.UUID
	Title       string
	Visibility  string
	State       string
	SourceKey   string
	DurationMs  int64
	Renditions  []Rendition
	PublishedAt *time.Time
	CreatedAt   time.Time
}

// Ingest inserts a new video row in the `ingested` state.
func (p *Postgres) Ingest(ctx context.Context, creatorID uuid.UUID, title, sourceKey string) (Video, error) {
	const q = `
		INSERT INTO videos (creator_id, title, source_key, state)
		VALUES ($1, $2, $3, 'ingested')
		RETURNING id, visibility, state, duration_ms, created_at`
	v := Video{CreatorID: creatorID, Title: title, SourceKey: sourceKey}
	err := p.pool.QueryRow(ctx, q, creatorID, title, sourceKey).Scan(
		&v.ID, &v.Visibility, &v.State, &v.DurationMs, &v.CreatedAt,
	)
	if err != nil {
		return Video{}, fmt.Errorf("ingest: %w", err)
	}
	return v, nil
}

// Get loads a video with its renditions.
func (p *Postgres) Get(ctx context.Context, id uuid.UUID) (Video, error) {
	const q = `
		SELECT id, creator_id, title, visibility, state, source_key, duration_ms, published_at, created_at
		FROM videos WHERE id = $1`
	var v Video
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&v.ID, &v.CreatorID, &v.Title, &v.Visibility, &v.State,
		&v.SourceKey, &v.DurationMs, &v.PublishedAt, &v.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Video{}, ErrNotFound
	}
	if err != nil {
		return Video{}, fmt.Errorf("get video: %w", err)
	}
	v.Renditions, err = p.renditions(ctx, id)
	if err != nil {
		return Video{}, err
	}
	return v, nil
}

func (p *Postgres) renditions(ctx context.Context, videoID uuid.UUID) ([]Rendition, error) {
	rows, err := p.pool.Query(ctx,
		`SELECT rung, codec, object_key, bytes, width, height, bitrate_kbps
		 FROM renditions WHERE video_id = $1 ORDER BY bitrate_kbps`, videoID)
	if err != nil {
		return nil, fmt.Errorf("renditions: %w", err)
	}
	defer rows.Close()
	out := []Rendition{}
	for rows.Next() {
		var r Rendition
		if err := rows.Scan(&r.Rung, &r.Codec, &r.ObjectKey, &r.Bytes, &r.Width, &r.Height, &r.BitrateKbps); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// SetState writes a new state. The caller is responsible for validating the
// transition against the domain state machine first.
func (p *Postgres) SetState(ctx context.Context, id uuid.UUID, state string) error {
	tag, err := p.pool.Exec(ctx, `UPDATE videos SET state = $2 WHERE id = $1`, id, state)
	if err != nil {
		return fmt.Errorf("set state: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Publish sets visibility, moves the state to published, stamps published_at.
func (p *Postgres) Publish(ctx context.Context, id uuid.UUID, visibility string) error {
	tag, err := p.pool.Exec(ctx,
		`UPDATE videos SET visibility = $2, state = 'published', published_at = now()
		 WHERE id = $1 AND state IN ('ready','published')`,
		id, visibility)
	if err != nil {
		return fmt.Errorf("publish: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// AddRendition upserts a rendition row.
func (p *Postgres) AddRendition(ctx context.Context, videoID uuid.UUID, r Rendition) error {
	const q = `
		INSERT INTO renditions (video_id, rung, codec, object_key, bytes, width, height, bitrate_kbps)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (video_id, rung) DO UPDATE SET
		  codec = EXCLUDED.codec, object_key = EXCLUDED.object_key, bytes = EXCLUDED.bytes,
		  width = EXCLUDED.width, height = EXCLUDED.height, bitrate_kbps = EXCLUDED.bitrate_kbps`
	tag, err := p.pool.Exec(ctx, q, videoID, r.Rung, r.Codec, r.ObjectKey, r.Bytes, r.Width, r.Height, r.BitrateKbps)
	if err != nil {
		return fmt.Errorf("add rendition: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// List returns a creator's videos, newest first.
func (p *Postgres) List(ctx context.Context, creatorID uuid.UUID, limit int) ([]Video, error) {
	if limit <= 0 || limit > 100 {
		limit = 25
	}
	rows, err := p.pool.Query(ctx,
		`SELECT id, creator_id, title, visibility, state, source_key, duration_ms, published_at, created_at
		 FROM videos WHERE creator_id = $1 ORDER BY created_at DESC LIMIT $2`,
		creatorID, limit)
	if err != nil {
		return nil, fmt.Errorf("list: %w", err)
	}
	defer rows.Close()
	out := []Video{}
	for rows.Next() {
		var v Video
		if err := rows.Scan(&v.ID, &v.CreatorID, &v.Title, &v.Visibility, &v.State,
			&v.SourceKey, &v.DurationMs, &v.PublishedAt, &v.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, rows.Err()
}
