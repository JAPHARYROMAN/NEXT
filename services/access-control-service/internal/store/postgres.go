// Package store is the access-control-service DAO.
package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrNotFound is returned when a role lookup misses.
var ErrNotFound = errors.New("not found")

// Postgres is the DAO.
type Postgres struct{ pool *pgxpool.Pool }

// NewPostgres wraps a pool.
func NewPostgres(pool *pgxpool.Pool) *Postgres { return &Postgres{pool: pool} }

// Ping is used by /readyz.
func (p *Postgres) Ping(ctx context.Context) error { return p.pool.Ping(ctx) }

// RolesForUser returns the roles bound to a user.
func (p *Postgres) RolesForUser(ctx context.Context, userID uuid.UUID) ([]string, error) {
	rows, err := p.pool.Query(ctx, `SELECT role FROM role_bindings WHERE user_id = $1 ORDER BY role`, userID)
	if err != nil {
		return nil, fmt.Errorf("roles for user: %w", err)
	}
	defer rows.Close()
	out := []string{}
	for rows.Next() {
		var r string
		if err := rows.Scan(&r); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// ScopesForUser returns the union of all scopes granted by the user's roles.
func (p *Postgres) ScopesForUser(ctx context.Context, userID uuid.UUID) (map[string]struct{}, error) {
	const q = `
		SELECT DISTINCT unnest(r.scopes)
		FROM role_bindings b JOIN roles r ON r.name = b.role
		WHERE b.user_id = $1`
	rows, err := p.pool.Query(ctx, q, userID)
	if err != nil {
		return nil, fmt.Errorf("scopes for user: %w", err)
	}
	defer rows.Close()
	out := map[string]struct{}{}
	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err != nil {
			return nil, err
		}
		out[s] = struct{}{}
	}
	return out, rows.Err()
}

// GrantRole binds a role to a user. Idempotent.
func (p *Postgres) GrantRole(ctx context.Context, userID uuid.UUID, role string, grantedBy uuid.UUID) error {
	const q = `INSERT INTO role_bindings (user_id, role, granted_by) VALUES ($1, $2, $3)
	           ON CONFLICT (user_id, role) DO NOTHING`
	if _, err := p.pool.Exec(ctx, q, userID, role, grantedBy); err != nil {
		if isFKViolation(err) {
			return ErrNotFound
		}
		return fmt.Errorf("grant role: %w", err)
	}
	return nil
}

// RevokeRole removes a role binding. No error if absent.
func (p *Postgres) RevokeRole(ctx context.Context, userID uuid.UUID, role string) error {
	if _, err := p.pool.Exec(ctx, `DELETE FROM role_bindings WHERE user_id = $1 AND role = $2`, userID, role); err != nil {
		return fmt.Errorf("revoke role: %w", err)
	}
	return nil
}

// RoleExists reports whether the named role is defined.
func (p *Postgres) RoleExists(ctx context.Context, role string) (bool, error) {
	var one int
	err := p.pool.QueryRow(ctx, `SELECT 1 FROM roles WHERE name = $1`, role).Scan(&one)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("role exists: %w", err)
	}
	return true, nil
}

func isFKViolation(err error) bool {
	return err != nil && (contains(err.Error(), "23503"))
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
