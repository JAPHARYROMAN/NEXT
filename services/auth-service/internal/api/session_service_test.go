package api

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
)

func TestValidateJWTActiveSession(t *testing.T) {
	userID := uuid.New()
	sessionID := uuid.New()
	issuer := newTestIssuer(t, 5*time.Minute)
	accessToken, _, err := issuer.MintForSession(userID.String(), sessionID.String(), "creator")
	if err != nil {
		t.Fatalf("MintForSession: %v", err)
	}

	svc := &SessionService{
		sessions: &fakeSessionStore{session: store.Session{
			ID:        sessionID,
			UserID:    userID,
			FamilyID:  uuid.New(),
			Method:    "magic_link",
			ExpiresAt: time.Now().Add(5 * time.Minute),
		}},
		revocations: &fakeRevocationCache{},
		verifier:    issuer,
		clock:       time.Now,
	}

	resp, err := svc.Validate(context.Background(), &authv1.ValidateRequest{AccessToken: accessToken})
	if err != nil {
		t.Fatalf("Validate returned error: %v", err)
	}
	if resp.GetSubject() != userID.String() {
		t.Fatalf("subject = %q, want %q", resp.GetSubject(), userID)
	}
	if resp.GetSessionId() != sessionID.String() {
		t.Fatalf("session_id = %q, want %q", resp.GetSessionId(), sessionID)
	}
	if resp.GetTier() != authv1.Tier_TIER_AUTHENTICATED {
		t.Fatalf("tier = %s, want %s", resp.GetTier(), authv1.Tier_TIER_AUTHENTICATED)
	}
}

func TestValidateJWTRejectsRevokedSession(t *testing.T) {
	userID := uuid.New()
	sessionID := uuid.New()
	issuer := newTestIssuer(t, 5*time.Minute)
	accessToken, _, err := issuer.MintForSession(userID.String(), sessionID.String(), "creator")
	if err != nil {
		t.Fatalf("MintForSession: %v", err)
	}

	svc := &SessionService{
		sessions: &fakeSessionStore{session: store.Session{
			ID:        sessionID,
			UserID:    userID,
			FamilyID:  uuid.New(),
			Method:    "magic_link",
			ExpiresAt: time.Now().Add(5 * time.Minute),
		}},
		revocations: &fakeRevocationCache{revoked: true},
		verifier:    issuer,
		clock:       time.Now,
	}

	_, err = svc.Validate(context.Background(), &authv1.ValidateRequest{AccessToken: accessToken})
	if status.Code(err) != codes.Unauthenticated {
		t.Fatalf("code = %s, want %s", status.Code(err), codes.Unauthenticated)
	}
}

func TestValidateJWTRejectsSubjectSessionMismatch(t *testing.T) {
	userID := uuid.New()
	sessionID := uuid.New()
	issuer := newTestIssuer(t, 5*time.Minute)
	accessToken, _, err := issuer.MintForSession(userID.String(), sessionID.String(), "creator")
	if err != nil {
		t.Fatalf("MintForSession: %v", err)
	}

	svc := &SessionService{
		sessions: &fakeSessionStore{session: store.Session{
			ID:        sessionID,
			UserID:    uuid.New(),
			FamilyID:  uuid.New(),
			Method:    "magic_link",
			ExpiresAt: time.Now().Add(5 * time.Minute),
		}},
		revocations: &fakeRevocationCache{},
		verifier:    issuer,
		clock:       time.Now,
	}

	_, err = svc.Validate(context.Background(), &authv1.ValidateRequest{AccessToken: accessToken})
	if status.Code(err) != codes.Unauthenticated {
		t.Fatalf("code = %s, want %s", status.Code(err), codes.Unauthenticated)
	}
}

func TestValidateJWTRejectsInvalidToken(t *testing.T) {
	svc := &SessionService{
		sessions:    &fakeSessionStore{},
		revocations: &fakeRevocationCache{},
		verifier:    newTestIssuer(t, 5*time.Minute),
		clock:       time.Now,
	}

	_, err := svc.Validate(context.Background(), &authv1.ValidateRequest{AccessToken: "not-a-jwt"})
	if status.Code(err) != codes.Unauthenticated {
		t.Fatalf("code = %s, want %s", status.Code(err), codes.Unauthenticated)
	}
}

type fakeSessionStore struct {
	session   store.Session
	getErr    error
	revokeErr error
	revokedID uuid.UUID
}

func (f *fakeSessionStore) GetSession(_ context.Context, id uuid.UUID) (store.Session, error) {
	if f.getErr != nil {
		return store.Session{}, f.getErr
	}
	if f.session.ID == uuid.Nil || f.session.ID != id {
		return store.Session{}, store.ErrNotFound
	}
	return f.session, nil
}

func (f *fakeSessionStore) RevokeSession(_ context.Context, id uuid.UUID) error {
	f.revokedID = id
	if f.revokeErr != nil {
		return f.revokeErr
	}
	if f.session.ID == uuid.Nil || f.session.ID != id {
		return store.ErrNotFound
	}
	return nil
}

type fakeRevocationCache struct {
	revoked bool
	err     error
	marked  string
}

func (f *fakeRevocationCache) IsSessionRevoked(context.Context, string) (bool, error) {
	if f.err != nil {
		return false, f.err
	}
	return f.revoked, nil
}

func (f *fakeRevocationCache) MarkSessionRevoked(_ context.Context, sessionID string, _ time.Duration) error {
	if f.err != nil {
		return f.err
	}
	f.marked = sessionID
	return nil
}

var errTestStore = errors.New("test store error")
