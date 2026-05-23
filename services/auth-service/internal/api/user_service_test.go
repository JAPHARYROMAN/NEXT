package api

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/domain"
	"github.com/next-ecosystem/next/services/auth-service/internal/eventbus"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
	"github.com/next-ecosystem/next/services/auth-service/internal/tokens"
)

func TestRegisterUserCreatesSessionTokenAndEvent(t *testing.T) {
	userID := uuid.New()
	now := time.Date(2026, 5, 23, 9, 0, 0, 0, time.UTC)
	issuer := newTestIssuer(t, time.Minute)
	registrar := &fakeRegistrationStore{userID: userID}
	events := &fakeRegistrationEvents{}
	svc := &UserService{
		users:  registrar,
		events: events,
		issuer: issuer,
		clock:  func() time.Time { return now },
	}

	resp, err := svc.RegisterUser(context.Background(), &authv1.RegisterUserRequest{
		Handle:      " Creator_1 ",
		DisplayName: "Creator One",
	})
	if err != nil {
		t.Fatalf("RegisterUser returned error: %v", err)
	}
	if resp.GetUserId() != userID.String() {
		t.Fatalf("user_id = %q, want %q", resp.GetUserId(), userID)
	}
	if registrar.handle != "creator_1" {
		t.Fatalf("stored handle = %q, want creator_1", registrar.handle)
	}
	if registrar.session.Method != string(domain.MethodMagicLink) {
		t.Fatalf("session method = %q, want %q", registrar.session.Method, domain.MethodMagicLink)
	}
	if registrar.session.ID == uuid.Nil {
		t.Fatal("session id was not generated")
	}
	if registrar.session.FamilyID == uuid.Nil {
		t.Fatal("session family id was not generated")
	}
	if !registrar.session.ExpiresAt.Equal(now.Add(time.Minute)) {
		t.Fatalf("session expires_at = %s, want %s", registrar.session.ExpiresAt, now.Add(time.Minute))
	}
	if resp.GetTokens().GetAccessToken() == "" {
		t.Fatal("access token was not returned")
	}

	claims, err := issuer.Verify(resp.GetTokens().GetAccessToken())
	if err != nil {
		t.Fatalf("verify issued token: %v", err)
	}
	if claims.Subject != userID.String() {
		t.Fatalf("token subject = %q, want %q", claims.Subject, userID)
	}
	if claims.SessionID != registrar.createdSession.ID.String() {
		t.Fatalf("token sid = %q, want %q", claims.SessionID, registrar.createdSession.ID)
	}
	if claims.Next.Handle != "creator_1" {
		t.Fatalf("token handle = %q, want creator_1", claims.Next.Handle)
	}

	if events.calls != 1 {
		t.Fatalf("event calls = %d, want 1", events.calls)
	}
	if events.body.UserID != userID.String() || events.body.Handle != "creator_1" || events.body.DisplayName != "Creator One" {
		t.Fatalf("event body = %+v", events.body)
	}
}

func TestRegisterUserRejectsInvalidHandle(t *testing.T) {
	registrar := &fakeRegistrationStore{}
	svc := &UserService{users: registrar, clock: time.Now}

	_, err := svc.RegisterUser(context.Background(), &authv1.RegisterUserRequest{Handle: "1bad"})
	if status.Code(err) != codes.InvalidArgument {
		t.Fatalf("code = %s, want %s", status.Code(err), codes.InvalidArgument)
	}
	if registrar.calls != 0 {
		t.Fatalf("store called %d times, want 0", registrar.calls)
	}
}

func TestRegisterUserMapsDuplicateHandle(t *testing.T) {
	registrar := &fakeRegistrationStore{
		err: errors.New("register user: ERROR: duplicate key value violates unique constraint (SQLSTATE 23505)"),
	}
	svc := &UserService{users: registrar, clock: time.Now}

	_, err := svc.RegisterUser(context.Background(), &authv1.RegisterUserRequest{Handle: "taken"})
	if status.Code(err) != codes.AlreadyExists {
		t.Fatalf("code = %s, want %s", status.Code(err), codes.AlreadyExists)
	}
}

func TestRegisterUserEventFailureDoesNotRollbackUser(t *testing.T) {
	userID := uuid.New()
	registrar := &fakeRegistrationStore{userID: userID}
	events := &fakeRegistrationEvents{err: errors.New("broker unavailable")}
	svc := &UserService{users: registrar, events: events, clock: time.Now}

	resp, err := svc.RegisterUser(context.Background(), &authv1.RegisterUserRequest{Handle: "creator"})
	if err != nil {
		t.Fatalf("RegisterUser returned error: %v", err)
	}
	if resp.GetUserId() != userID.String() {
		t.Fatalf("user_id = %q, want %q", resp.GetUserId(), userID)
	}
	if events.calls != 1 {
		t.Fatalf("event calls = %d, want 1", events.calls)
	}
}

type fakeRegistrationStore struct {
	userID         uuid.UUID
	createdSession store.Session
	err            error
	calls          int
	id             uuid.UUID
	handle         string
	session        store.Session
}

func (f *fakeRegistrationStore) RegisterUserWithSession(_ context.Context, id uuid.UUID, handle string, session store.Session) (uuid.UUID, store.Session, error) {
	f.calls++
	f.id = id
	f.handle = handle
	f.session = session
	if f.err != nil {
		return uuid.Nil, store.Session{}, f.err
	}
	userID := f.userID
	if userID == uuid.Nil {
		userID = uuid.New()
	}
	session.UserID = userID
	if f.createdSession.ID != uuid.Nil {
		session.ID = f.createdSession.ID
	}
	f.createdSession = session
	return userID, session, nil
}

type fakeRegistrationEvents struct {
	err   error
	calls int
	body  eventbus.UserRegistered
}

func (f *fakeRegistrationEvents) EmitUserRegistered(_ context.Context, body eventbus.UserRegistered) error {
	f.calls++
	f.body = body
	if f.err != nil && strings.TrimSpace(f.err.Error()) != "" {
		return f.err
	}
	return nil
}

func newTestIssuer(t *testing.T, ttl time.Duration) *tokens.Issuer {
	t.Helper()
	issuer, err := tokens.NewIssuer(tokens.Config{
		Issuer:    "https://auth.test",
		Audience:  "next-test",
		AccessTTL: ttl,
	})
	if err != nil {
		t.Fatalf("NewIssuer: %v", err)
	}
	return issuer
}
