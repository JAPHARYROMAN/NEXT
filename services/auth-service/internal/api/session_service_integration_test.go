//go:build integration

// Integration test for the SessionService.
//
// Requires a running Postgres (with the auth-service migrations applied) and Redis.
// Run via:
//
//	NEXT_TEST_PG_URL=postgres://next:next@localhost:5432/auth \
//	NEXT_TEST_REDIS_URL=redis://localhost:6379/1 \
//	go test -tags=integration ./internal/api/...
package api

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
)

func openTestDeps(t *testing.T) (*store.Postgres, *store.Redis) {
	t.Helper()
	pgURL := envOr(t, "NEXT_TEST_PG_URL", "postgres://next:next@localhost:5432/auth")
	rdURL := envOr(t, "NEXT_TEST_REDIS_URL", "redis://localhost:6379/1")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, pgURL)
	if err != nil {
		t.Fatalf("pg connect: %v", err)
	}
	t.Cleanup(pool.Close)

	if err := pool.Ping(ctx); err != nil {
		t.Skipf("postgres at %s unreachable: %v", pgURL, err)
	}

	rdOpts, err := redis.ParseURL(rdURL)
	if err != nil {
		t.Fatalf("redis parse: %v", err)
	}
	rd := redis.NewClient(rdOpts)
	t.Cleanup(func() { _ = rd.Close() })

	if err := rd.Ping(ctx).Err(); err != nil {
		t.Skipf("redis at %s unreachable: %v", rdURL, err)
	}
	if err := rd.FlushDB(ctx).Err(); err != nil {
		t.Fatalf("redis flush: %v", err)
	}

	return store.NewPostgres(pool), store.NewRedis(rd)
}

func envOr(t *testing.T, key, fallback string) string {
	t.Helper()
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func seedUser(t *testing.T, pg *store.Postgres) uuid.UUID {
	t.Helper()
	pool := pgPoolFromStore(t, pg)

	handle := "test-" + uuid.NewString()
	var userID uuid.UUID
	row := pool.QueryRow(context.Background(),
		`INSERT INTO users (handle) VALUES ($1) RETURNING id`, handle)
	if err := row.Scan(&userID); err != nil {
		t.Fatalf("insert user: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DELETE FROM users WHERE id = $1`, userID)
	})
	return userID
}

// pgPoolFromStore returns the underlying pool. Tests deliberately need direct
// access for arrange-phase seeding even though application code goes via the DAO.
func pgPoolFromStore(t *testing.T, _ *store.Postgres) *pgxpool.Pool {
	t.Helper()
	pgURL := envOr(t, "NEXT_TEST_PG_URL", "postgres://next:next@localhost:5432/auth")
	pool, err := pgxpool.New(context.Background(), pgURL)
	if err != nil {
		t.Fatalf("pg connect for seed: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func TestValidate_ActiveSession(t *testing.T) {
	pg, rd := openTestDeps(t)
	svc := NewSessionService(pg, rd, nil)
	userID := seedUser(t, pg)

	created, err := pg.CreateSession(context.Background(), store.Session{
		UserID:    userID,
		FamilyID:  uuid.New(),
		Method:    "password",
		ExpiresAt: time.Now().Add(15 * time.Minute),
	})
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	resp, err := svc.Validate(context.Background(), &authv1.ValidateRequest{
		AccessToken: created.ID.String(),
	})
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if resp.GetSubject() != userID.String() {
		t.Errorf("subject = %q, want %q", resp.GetSubject(), userID.String())
	}
	if resp.GetSessionId() != created.ID.String() {
		t.Errorf("session_id = %q, want %q", resp.GetSessionId(), created.ID.String())
	}
}

func TestValidate_ExpiredSession(t *testing.T) {
	pg, rd := openTestDeps(t)
	svc := NewSessionService(pg, rd, nil)
	userID := seedUser(t, pg)

	created, err := pg.CreateSession(context.Background(), store.Session{
		UserID:    userID,
		FamilyID:  uuid.New(),
		Method:    "password",
		ExpiresAt: time.Now().Add(-1 * time.Minute),
	})
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	_, err = svc.Validate(context.Background(), &authv1.ValidateRequest{
		AccessToken: created.ID.String(),
	})
	if status.Code(err) != codes.Unauthenticated {
		t.Errorf("expected Unauthenticated, got %v", err)
	}
}

func TestRevokeThenValidate(t *testing.T) {
	pg, rd := openTestDeps(t)
	svc := NewSessionService(pg, rd, nil)
	userID := seedUser(t, pg)

	created, err := pg.CreateSession(context.Background(), store.Session{
		UserID:    userID,
		FamilyID:  uuid.New(),
		Method:    "password",
		ExpiresAt: time.Now().Add(15 * time.Minute),
	})
	if err != nil {
		t.Fatalf("create session: %v", err)
	}

	if _, err := svc.Revoke(context.Background(), &authv1.RevokeRequest{
		SessionId: created.ID.String(),
	}); err != nil {
		t.Fatalf("revoke: %v", err)
	}

	_, err = svc.Validate(context.Background(), &authv1.ValidateRequest{
		AccessToken: created.ID.String(),
	})
	if status.Code(err) != codes.Unauthenticated {
		t.Errorf("expected Unauthenticated after revoke, got %v", err)
	}
}

func TestValidate_UnknownSession(t *testing.T) {
	pg, rd := openTestDeps(t)
	svc := NewSessionService(pg, rd, nil)
	_, err := svc.Validate(context.Background(), &authv1.ValidateRequest{
		AccessToken: uuid.NewString(),
	})
	if status.Code(err) != codes.NotFound {
		t.Errorf("expected NotFound, got %v", err)
	}
}
