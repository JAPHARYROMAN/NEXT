// Package store is the profile-service DAO.
package store

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/next-ecosystem/next/services/profile-service/internal/domain"
)

// ErrNotFound is returned when no row matches.
var ErrNotFound = errors.New("not found")

// ErrHandleTaken is returned when the unique handle is already in use.
var ErrHandleTaken = errors.New("handle taken")

// ErrAlreadyFollowing is returned when an idempotent follow already exists.
var ErrAlreadyFollowing = errors.New("already following")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz. Caller controls deadline.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// CreateProfile inserts a fresh profile.
func (p *Postgres) CreateProfile(ctx context.Context, prof domain.Profile) (domain.Profile, error) {
	if !prof.Tier.IsValid() {
		prof.Tier = domain.TierAuthenticated
	}
	const q = `
		INSERT INTO profiles (user_id, handle, display_name, bio, tier)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING followers, following, created_at, updated_at`
	err := p.pool.QueryRow(ctx, q,
		prof.UserID, prof.Handle, prof.DisplayName, prof.Bio, string(prof.Tier),
	).Scan(&prof.Followers, &prof.Following, &prof.CreatedAt, &prof.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err, "profiles_pkey") {
			return domain.Profile{}, fmt.Errorf("profile already exists for user: %w", err)
		}
		if isUniqueViolation(err, "profiles_handle_key") || strings.Contains(err.Error(), "profiles_handle_active_idx") {
			return domain.Profile{}, ErrHandleTaken
		}
		return domain.Profile{}, fmt.Errorf("insert profile: %w", err)
	}
	return prof, nil
}

// GetProfile reads a profile by user ID.
func (p *Postgres) GetProfile(ctx context.Context, userID uuid.UUID) (domain.Profile, error) {
	const q = `
		SELECT user_id, handle, display_name, bio, tier, followers, following, created_at, updated_at
		FROM profiles WHERE user_id = $1 AND deleted_at IS NULL`
	var prof domain.Profile
	var tier string
	err := p.pool.QueryRow(ctx, q, userID).Scan(
		&prof.UserID, &prof.Handle, &prof.DisplayName, &prof.Bio,
		&tier, &prof.Followers, &prof.Following, &prof.CreatedAt, &prof.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Profile{}, ErrNotFound
	}
	if err != nil {
		return domain.Profile{}, fmt.Errorf("get profile: %w", err)
	}
	prof.Tier = domain.Tier(tier)
	return prof, nil
}

// UpdateProfile patches handle / display_name / bio.
// nil fields are left untouched.
func (p *Postgres) UpdateProfile(ctx context.Context, userID uuid.UUID, handle, displayName, bio *string) (domain.Profile, error) {
	sets := []string{}
	args := []any{userID}
	idx := 2
	if handle != nil {
		sets = append(sets, fmt.Sprintf("handle = $%d", idx))
		args = append(args, *handle)
		idx++
	}
	if displayName != nil {
		sets = append(sets, fmt.Sprintf("display_name = $%d", idx))
		args = append(args, *displayName)
		idx++
	}
	if bio != nil {
		sets = append(sets, fmt.Sprintf("bio = $%d", idx))
		args = append(args, *bio)
		idx++
	}
	if len(sets) == 0 {
		return p.GetProfile(ctx, userID)
	}
	q := fmt.Sprintf(`UPDATE profiles SET %s WHERE user_id = $1 AND deleted_at IS NULL`, strings.Join(sets, ", "))
	tag, err := p.pool.Exec(ctx, q, args...)
	if err != nil {
		if isUniqueViolation(err, "profiles_handle_key") || strings.Contains(err.Error(), "profiles_handle_active_idx") {
			return domain.Profile{}, ErrHandleTaken
		}
		return domain.Profile{}, fmt.Errorf("update profile: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.Profile{}, ErrNotFound
	}
	return p.GetProfile(ctx, userID)
}

// Follow inserts a follow edge. Idempotent on the (follower, followee) pair.
func (p *Postgres) Follow(ctx context.Context, follower, followee uuid.UUID) error {
	if follower == followee {
		return domain.ErrSelfFollow
	}
	const q = `INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2)
	           ON CONFLICT (follower_id, followee_id) DO NOTHING`
	tag, err := p.pool.Exec(ctx, q, follower, followee)
	if err != nil {
		return fmt.Errorf("follow: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrAlreadyFollowing
	}
	return nil
}

// Unfollow removes a follow edge. No error if it didn't exist.
func (p *Postgres) Unfollow(ctx context.Context, follower, followee uuid.UUID) error {
	const q = `DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2`
	if _, err := p.pool.Exec(ctx, q, follower, followee); err != nil {
		return fmt.Errorf("unfollow: %w", err)
	}
	return nil
}

// FollowEdge is one row of the followers/following listing.
type FollowEdge struct {
	UserID    uuid.UUID
	Handle    string
	CreatedAt time.Time
}

// ListFollowers returns up to `limit` followers of `userID`, after the given cursor.
// Cursor is the created_at of the previous page's last row, RFC3339Nano.
func (p *Postgres) ListFollowers(ctx context.Context, userID uuid.UUID, limit int, after string) ([]FollowEdge, string, error) {
	return p.listEdges(ctx, userID, limit, after, true)
}

// ListFollowing returns the users that `userID` is following.
func (p *Postgres) ListFollowing(ctx context.Context, userID uuid.UUID, limit int, after string) ([]FollowEdge, string, error) {
	return p.listEdges(ctx, userID, limit, after, false)
}

func (p *Postgres) listEdges(ctx context.Context, userID uuid.UUID, limit int, after string, asFollowee bool) ([]FollowEdge, string, error) {
	if limit <= 0 || limit > 100 {
		limit = 25
	}
	var cursor time.Time
	if after != "" {
		t, err := time.Parse(time.RFC3339Nano, after)
		if err != nil {
			return nil, "", fmt.Errorf("invalid cursor: %w", err)
		}
		cursor = t
	} else {
		cursor = time.Now().Add(100 * 365 * 24 * time.Hour)
	}

	var q string
	if asFollowee {
		// Listing followers: people who follow userID.
		q = `
			SELECT f.follower_id, p.handle, f.created_at
			FROM follows f
			LEFT JOIN profiles p ON p.user_id = f.follower_id
			WHERE f.followee_id = $1 AND f.created_at < $2
			ORDER BY f.created_at DESC
			LIMIT $3`
	} else {
		q = `
			SELECT f.followee_id, p.handle, f.created_at
			FROM follows f
			LEFT JOIN profiles p ON p.user_id = f.followee_id
			WHERE f.follower_id = $1 AND f.created_at < $2
			ORDER BY f.created_at DESC
			LIMIT $3`
	}

	rows, err := p.pool.Query(ctx, q, userID, cursor, limit)
	if err != nil {
		return nil, "", fmt.Errorf("list edges: %w", err)
	}
	defer rows.Close()

	out := make([]FollowEdge, 0, limit)
	for rows.Next() {
		var e FollowEdge
		var handle *string
		if err := rows.Scan(&e.UserID, &handle, &e.CreatedAt); err != nil {
			return nil, "", err
		}
		if handle != nil {
			e.Handle = *handle
		}
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		return nil, "", err
	}

	nextCursor := ""
	if len(out) == limit {
		nextCursor = out[len(out)-1].CreatedAt.Format(time.RFC3339Nano)
	}
	return out, nextCursor, nil
}

// isUniqueViolation returns true when err is a Postgres 23505 on the named constraint.
func isUniqueViolation(err error, constraint string) bool {
	if err == nil {
		return false
	}
	s := err.Error()
	return strings.Contains(s, "23505") && strings.Contains(s, constraint)
}
