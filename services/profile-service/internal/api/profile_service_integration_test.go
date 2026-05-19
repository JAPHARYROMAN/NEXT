//go:build integration

// Integration tests for profile-service.
//
//	NEXT_TEST_PG_URL=postgres://next:next@localhost:5433/profile?sslmode=disable \
//	go test -tags=integration ./internal/api/...
package api

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
	"github.com/next-ecosystem/next/services/profile-service/internal/store"
)

func openTestStore(t *testing.T) *store.Postgres {
	t.Helper()
	url := os.Getenv("NEXT_TEST_PG_URL")
	if url == "" {
		url = "postgres://next:next@localhost:5433/profile?sslmode=disable"
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("pg connect: %v", err)
	}
	t.Cleanup(pool.Close)
	if err := pool.Ping(ctx); err != nil {
		t.Skipf("postgres at %s unreachable: %v", url, err)
	}
	// Per-test isolation — clear out any leftover state.
	if _, err := pool.Exec(context.Background(),
		`TRUNCATE follows, mutes, blocks, profiles CASCADE`); err != nil {
		t.Fatalf("truncate: %v", err)
	}
	return store.NewPostgres(pool)
}

func TestCreate_ProfileHappyPath(t *testing.T) {
	pg := openTestStore(t)
	svc := NewProfileService(pg, nil)

	userID := uuid.New().String()
	resp, err := svc.Create(context.Background(), &profilev1.CreateRequest{
		UserId:      userID,
		Handle:      "alice_" + uuid.NewString()[:4],
		DisplayName: "Alice",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if resp.GetProfile().GetUserId() != userID {
		t.Errorf("user_id = %q, want %q", resp.GetProfile().GetUserId(), userID)
	}
	if resp.GetProfile().GetTier() != profilev1.Tier_TIER_AUTHENTICATED {
		t.Errorf("expected TIER_AUTHENTICATED")
	}
}

func TestCreate_DuplicateHandle(t *testing.T) {
	pg := openTestStore(t)
	svc := NewProfileService(pg, nil)

	handle := "dup_" + uuid.NewString()[:6]
	_, err := svc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: handle, DisplayName: "x",
	})
	if err != nil {
		t.Fatalf("first create: %v", err)
	}
	_, err = svc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: handle, DisplayName: "y",
	})
	if status.Code(err) != codes.AlreadyExists {
		t.Errorf("expected AlreadyExists, got %v", err)
	}
}

func TestCreate_InvalidHandle(t *testing.T) {
	pg := openTestStore(t)
	svc := NewProfileService(pg, nil)

	cases := []string{"ab", "Bad-Handle", "_starts_underscore", "9starts_digit"}
	for _, h := range cases {
		_, err := svc.Create(context.Background(), &profilev1.CreateRequest{
			UserId: uuid.New().String(), Handle: h,
		})
		if status.Code(err) != codes.InvalidArgument {
			t.Errorf("handle %q: expected InvalidArgument, got %v", h, err)
		}
	}
}

func TestFollow_Lifecycle(t *testing.T) {
	pg := openTestStore(t)
	psvc := NewProfileService(pg, nil)
	gsvc := NewSocialGraphService(pg, nil)

	alice, _ := psvc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: "alice_" + uuid.NewString()[:4],
	})
	bob, _ := psvc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: "bob_" + uuid.NewString()[:4],
	})

	// Follow.
	if _, err := gsvc.Follow(context.Background(), &profilev1.FollowRequest{
		FollowerId: alice.GetProfile().GetUserId(),
		FolloweeId: bob.GetProfile().GetUserId(),
	}); err != nil {
		t.Fatalf("follow: %v", err)
	}

	// Idempotency: second follow shouldn't error.
	if _, err := gsvc.Follow(context.Background(), &profilev1.FollowRequest{
		FollowerId: alice.GetProfile().GetUserId(),
		FolloweeId: bob.GetProfile().GetUserId(),
	}); err != nil {
		t.Fatalf("idempotent follow: %v", err)
	}

	// Counters updated.
	bobGet, err := psvc.Get(context.Background(), &profilev1.GetRequest{UserId: bob.GetProfile().GetUserId()})
	if err != nil {
		t.Fatalf("get bob: %v", err)
	}
	if bobGet.GetProfile().GetFollowers() != 1 {
		t.Errorf("bob.followers = %d, want 1", bobGet.GetProfile().GetFollowers())
	}
	aliceGet, _ := psvc.Get(context.Background(), &profilev1.GetRequest{UserId: alice.GetProfile().GetUserId()})
	if aliceGet.GetProfile().GetFollowing() != 1 {
		t.Errorf("alice.following = %d, want 1", aliceGet.GetProfile().GetFollowing())
	}

	// Followers listing.
	followers, err := gsvc.Followers(context.Background(), &profilev1.FollowersRequest{
		UserId: bob.GetProfile().GetUserId(), Limit: 10,
	})
	if err != nil {
		t.Fatalf("followers: %v", err)
	}
	if len(followers.GetEdges()) != 1 {
		t.Fatalf("followers edges = %d, want 1", len(followers.GetEdges()))
	}
	if followers.GetEdges()[0].GetUserId() != alice.GetProfile().GetUserId() {
		t.Errorf("follower user_id mismatch")
	}

	// Unfollow.
	if _, err := gsvc.Unfollow(context.Background(), &profilev1.UnfollowRequest{
		FollowerId: alice.GetProfile().GetUserId(),
		FolloweeId: bob.GetProfile().GetUserId(),
	}); err != nil {
		t.Fatalf("unfollow: %v", err)
	}
	bobGet2, _ := psvc.Get(context.Background(), &profilev1.GetRequest{UserId: bob.GetProfile().GetUserId()})
	if bobGet2.GetProfile().GetFollowers() != 0 {
		t.Errorf("bob.followers after unfollow = %d, want 0", bobGet2.GetProfile().GetFollowers())
	}
}

func TestFollow_SelfRejected(t *testing.T) {
	pg := openTestStore(t)
	psvc := NewProfileService(pg, nil)
	gsvc := NewSocialGraphService(pg, nil)

	alice, _ := psvc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: "alice_" + uuid.NewString()[:4],
	})
	_, err := gsvc.Follow(context.Background(), &profilev1.FollowRequest{
		FollowerId: alice.GetProfile().GetUserId(),
		FolloweeId: alice.GetProfile().GetUserId(),
	})
	if status.Code(err) != codes.InvalidArgument {
		t.Errorf("expected InvalidArgument for self-follow, got %v", err)
	}
}

func TestUpdate_HandleAndBio(t *testing.T) {
	pg := openTestStore(t)
	svc := NewProfileService(pg, nil)

	created, _ := svc.Create(context.Background(), &profilev1.CreateRequest{
		UserId: uuid.New().String(), Handle: "before_" + uuid.NewString()[:4],
	})
	newHandle := "after_" + uuid.NewString()[:4]
	bio := "hello world"
	resp, err := svc.Update(context.Background(), &profilev1.UpdateRequest{
		UserId: created.GetProfile().GetUserId(),
		Handle: &newHandle,
		Bio:    &bio,
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if resp.GetProfile().GetHandle() != newHandle {
		t.Errorf("handle = %q, want %q", resp.GetProfile().GetHandle(), newHandle)
	}
	if resp.GetProfile().GetBio() != bio {
		t.Errorf("bio = %q, want %q", resp.GetProfile().GetBio(), bio)
	}
}
