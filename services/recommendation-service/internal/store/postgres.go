// Package store is the recommendation-service persistence layer: the
// served-slate log + per-item score breakdown + feedback signals.
package store

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a slate does not exist.
var ErrNotFound = errors.New("slate not found")

// Postgres is the recommendation datastore.
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

// SlateItem is one persisted entry of a served slate.
type SlateItem struct {
	Position        int
	ContentID       string
	CreatorID       string
	Relevance       float64
	Novelty         float64
	DiversityMargin float64
	FinalScore      float64
	Exploration     bool
	Sources         []string
}

// Slate is a served recommendation slate plus its measured diversity.
type Slate struct {
	ID               string
	UserID           string
	SessionID        string
	Surface          string
	Mode             string
	Appetite         float64
	ExplorationShare float64
	CreatorGini      float64
	TopicEntropy     float64
	MaxCreatorShare  float64
	DistinctCreators int
	Items            []SlateItem
	CreatedAt        time.Time
}

// SaveSlate persists a served slate and its items atomically. It returns the
// slate id (generated if the caller did not supply one).
func (p *Postgres) SaveSlate(ctx context.Context, s Slate) (string, error) {
	if s.ID == "" {
		s.ID = uuid.NewString()
	}
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO served_slates
			(id, user_id, session_id, surface, mode, appetite, item_count,
			 exploration_share, creator_gini, topic_entropy, max_creator_share)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		s.ID, s.UserID, s.SessionID, s.Surface, s.Mode, s.Appetite, len(s.Items),
		s.ExplorationShare, s.CreatorGini, s.TopicEntropy, s.MaxCreatorShare)
	if err != nil {
		return "", err
	}

	for _, it := range s.Items {
		_, err = tx.Exec(ctx, `
			INSERT INTO slate_items
				(slate_id, position, content_id, creator_id, relevance, novelty,
				 diversity_margin, final_score, exploration, sources)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
			s.ID, it.Position, it.ContentID, it.CreatorID, it.Relevance, it.Novelty,
			it.DiversityMargin, it.FinalScore, it.Exploration, it.Sources)
		if err != nil {
			return "", err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return "", err
	}
	return s.ID, nil
}

// GetSlate loads a served slate and its items in served order.
func (p *Postgres) GetSlate(ctx context.Context, slateID string) (Slate, error) {
	var s Slate
	err := p.pool.QueryRow(ctx, `
		SELECT id, user_id, session_id, surface, mode, appetite,
		       exploration_share, creator_gini, topic_entropy, max_creator_share,
		       created_at
		FROM served_slates WHERE id = $1`, slateID).
		Scan(&s.ID, &s.UserID, &s.SessionID, &s.Surface, &s.Mode, &s.Appetite,
			&s.ExplorationShare, &s.CreatorGini, &s.TopicEntropy, &s.MaxCreatorShare,
			&s.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return Slate{}, ErrNotFound
	}
	if err != nil {
		return Slate{}, err
	}

	rows, err := p.pool.Query(ctx, `
		SELECT position, content_id, creator_id, relevance, novelty,
		       diversity_margin, final_score, exploration, sources
		FROM slate_items WHERE slate_id = $1 ORDER BY position`, slateID)
	if err != nil {
		return Slate{}, err
	}
	defer rows.Close()

	seen := map[string]struct{}{}
	for rows.Next() {
		var it SlateItem
		if err := rows.Scan(&it.Position, &it.ContentID, &it.CreatorID, &it.Relevance,
			&it.Novelty, &it.DiversityMargin, &it.FinalScore, &it.Exploration,
			&it.Sources); err != nil {
			return Slate{}, err
		}
		s.Items = append(s.Items, it)
		seen[it.CreatorID] = struct{}{}
	}
	s.DistinctCreators = len(seen)
	return s, rows.Err()
}

// RecordFeedback persists a feedback signal against a served slate.
func (p *Postgres) RecordFeedback(ctx context.Context, slateID, contentID, kind string, dwellMs int64) error {
	_, err := p.pool.Exec(ctx, `
		INSERT INTO feedback (slate_id, content_id, kind, dwell_ms)
		VALUES ($1,$2,$3,$4)`, slateID, contentID, kind, dwellMs)
	return err
}
