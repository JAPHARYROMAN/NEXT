// Package store is the transcoding-service DAO.
package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/next-ecosystem/next/services/transcoding-service/internal/ladder"
)

// ErrNotFound is returned when a job lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Job is the in-memory shape.
type Job struct {
	ID             uuid.UUID
	VideoID        uuid.UUID
	SourceKey      string
	SourceHeight   int32
	State          string
	Ladder         []ladder.Rung
	CompletedRungs []string
	CreatedAt      time.Time
}

// Submit queues a transcode job with a content-adaptive ladder.
func (p *Postgres) Submit(ctx context.Context, videoID uuid.UUID, sourceKey string, sourceHeight int32) (Job, error) {
	rungs := ladder.For(sourceHeight)
	ladderJSON, err := json.Marshal(rungs)
	if err != nil {
		return Job{}, fmt.Errorf("marshal ladder: %w", err)
	}
	const q = `
		INSERT INTO transcode_jobs (video_id, source_key, source_height, ladder)
		VALUES ($1, $2, $3, $4)
		RETURNING id, state, created_at`
	j := Job{VideoID: videoID, SourceKey: sourceKey, SourceHeight: sourceHeight, Ladder: rungs, CompletedRungs: []string{}}
	if err := p.pool.QueryRow(ctx, q, videoID, sourceKey, sourceHeight, ladderJSON).Scan(
		&j.ID, &j.State, &j.CreatedAt,
	); err != nil {
		return Job{}, fmt.Errorf("submit: %w", err)
	}
	return j, nil
}

// Get loads a job by ID.
func (p *Postgres) Get(ctx context.Context, id uuid.UUID) (Job, error) {
	const q = `
		SELECT id, video_id, source_key, source_height, state, ladder, completed_rungs, created_at
		FROM transcode_jobs WHERE id = $1`
	var j Job
	var ladderJSON []byte
	err := p.pool.QueryRow(ctx, q, id).Scan(
		&j.ID, &j.VideoID, &j.SourceKey, &j.SourceHeight, &j.State,
		&ladderJSON, &j.CompletedRungs, &j.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Job{}, ErrNotFound
	}
	if err != nil {
		return Job{}, fmt.Errorf("get job: %w", err)
	}
	if err := json.Unmarshal(ladderJSON, &j.Ladder); err != nil {
		return Job{}, fmt.Errorf("unmarshal ladder: %w", err)
	}
	return j, nil
}

// ClaimNext atomically claims the oldest queued job for a worker.
// Returns ErrNotFound when the queue is empty.
func (p *Postgres) ClaimNext(ctx context.Context, workerID string) (Job, error) {
	const q = `
		UPDATE transcode_jobs SET state = 'running', claimed_by = $1, updated_at = now()
		WHERE id = (
			SELECT id FROM transcode_jobs WHERE state = 'queued'
			ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1
		)
		RETURNING id`
	var id uuid.UUID
	err := p.pool.QueryRow(ctx, q, workerID).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return Job{}, ErrNotFound
	}
	if err != nil {
		return Job{}, fmt.Errorf("claim next: %w", err)
	}
	return p.Get(ctx, id)
}

// CompleteRung marks one rung done. When every ladder rung is complete the job
// moves to `completed`. Returns the updated job + whether it just completed.
func (p *Postgres) CompleteRung(ctx context.Context, jobID uuid.UUID, rung string) (Job, bool, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return Job{}, false, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx,
		`UPDATE transcode_jobs
		 SET completed_rungs = (
		   SELECT ARRAY(SELECT DISTINCT unnest(completed_rungs || ARRAY[$2]))
		 ), updated_at = now()
		 WHERE id = $1`,
		jobID, rung); err != nil {
		return Job{}, false, fmt.Errorf("complete rung: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Job{}, false, err
	}

	j, err := p.Get(ctx, jobID)
	if err != nil {
		return Job{}, false, err
	}
	complete := len(j.CompletedRungs) >= len(j.Ladder)
	if complete && j.State != "completed" {
		if err := p.setState(ctx, jobID, "completed"); err != nil {
			return Job{}, false, err
		}
		j.State = "completed"
	}
	return j, complete, nil
}

func (p *Postgres) setState(ctx context.Context, id uuid.UUID, state string) error {
	_, err := p.pool.Exec(ctx, `UPDATE transcode_jobs SET state = $2, updated_at = now() WHERE id = $1`, id, state)
	return err
}
