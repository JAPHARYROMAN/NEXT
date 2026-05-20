// Package store is the orchestrator DAO.
package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/next-ecosystem/next/services/media-processing-orchestrator/internal/saga"
)

// ErrNotFound is returned when a run lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// Run is the in-memory shape.
type Run struct {
	ID        uuid.UUID
	VideoID   uuid.UUID
	SourceKey string
	State     string
	Stages    []saga.StageState
	StartedAt time.Time
}

// StartRun opens a pipeline run for a video with all stages pending.
// Idempotent: if a run already exists for the video, returns it.
func (p *Postgres) StartRun(ctx context.Context, videoID uuid.UUID, sourceKey string) (Run, error) {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return Run{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var runID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT id FROM pipeline_runs WHERE video_id = $1`, videoID).Scan(&runID)
	if errors.Is(err, pgx.ErrNoRows) {
		if err := tx.QueryRow(ctx,
			`INSERT INTO pipeline_runs (video_id, source_key) VALUES ($1, $2) RETURNING id`,
			videoID, sourceKey).Scan(&runID); err != nil {
			return Run{}, fmt.Errorf("insert run: %w", err)
		}
		for _, stage := range saga.Stages {
			if _, err := tx.Exec(ctx,
				`INSERT INTO stage_status (run_id, stage) VALUES ($1, $2)`, runID, stage); err != nil {
				return Run{}, fmt.Errorf("insert stage: %w", err)
			}
		}
	} else if err != nil {
		return Run{}, fmt.Errorf("lookup run: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Run{}, err
	}
	return p.getByVideo(ctx, videoID)
}

// GetByVideo loads the run for a video.
func (p *Postgres) GetByVideo(ctx context.Context, videoID uuid.UUID) (Run, error) {
	return p.getByVideo(ctx, videoID)
}

func (p *Postgres) getByVideo(ctx context.Context, videoID uuid.UUID) (Run, error) {
	var r Run
	err := p.pool.QueryRow(ctx,
		`SELECT id, video_id, source_key, state, started_at FROM pipeline_runs WHERE video_id = $1`,
		videoID,
	).Scan(&r.ID, &r.VideoID, &r.SourceKey, &r.State, &r.StartedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Run{}, ErrNotFound
	}
	if err != nil {
		return Run{}, fmt.Errorf("get run: %w", err)
	}
	rows, err := p.pool.Query(ctx,
		`SELECT stage, status, attempts, detail FROM stage_status WHERE run_id = $1 ORDER BY stage`, r.ID)
	if err != nil {
		return Run{}, fmt.Errorf("get stages: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var s saga.StageState
		if err := rows.Scan(&s.Stage, &s.Status, &s.Attempts, &s.Detail); err != nil {
			return Run{}, err
		}
		r.Stages = append(r.Stages, s)
	}
	return r, rows.Err()
}

// ReportStage records a stage result and re-evaluates the run outcome.
// Returns the updated run + whether the run just completed/failed.
func (p *Postgres) ReportStage(ctx context.Context, videoID uuid.UUID, stage, status, detail string) (Run, bool, bool, error) {
	r, err := p.getByVideo(ctx, videoID)
	if err != nil {
		return Run{}, false, false, err
	}
	if _, err := p.pool.Exec(ctx,
		`UPDATE stage_status SET status = $3, detail = $4, attempts = attempts + 1
		 WHERE run_id = $1 AND stage = $2`,
		r.ID, stage, status, detail); err != nil {
		return Run{}, false, false, fmt.Errorf("update stage: %w", err)
	}

	updated, err := p.getByVideo(ctx, videoID)
	if err != nil {
		return Run{}, false, false, err
	}
	outcome := saga.Evaluate(updated.Stages)
	if outcome.Complete && updated.State == "running" {
		_ = p.setRunState(ctx, r.ID, "completed")
		updated.State = "completed"
	} else if outcome.Failed && updated.State == "running" {
		_ = p.setRunState(ctx, r.ID, "failed")
		updated.State = "failed"
	}
	return updated, outcome.Complete, outcome.Failed, nil
}

func (p *Postgres) setRunState(ctx context.Context, runID uuid.UUID, state string) error {
	_, err := p.pool.Exec(ctx,
		`UPDATE pipeline_runs SET state = $2, updated_at = now() WHERE id = $1`, runID, state)
	return err
}
