package api

import (
	"context"
	"log/slog"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/eventbus"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
)

// handleRegex enforces the same rules profile-service applies; we validate at the
// edge so the event we publish is always well-formed.
var handleRegex = regexp.MustCompile(`^[a-z][a-z0-9_]{2,29}$`)

// UserService implements auth.v1.UserService.
type UserService struct {
	authv1.UnimplementedUserServiceServer

	pg     *store.Postgres
	events *eventbus.Producer
}

// NewUserService constructs the handler.
func NewUserService(pg *store.Postgres, ev *eventbus.Producer) *UserService {
	return &UserService{pg: pg, events: ev}
}

// RegisterUser creates the user row and emits auth.user.registered.v1.
// Profile-service consumes that event to materialize a matching profile —
// no synchronous coupling between auth and profile.
func (s *UserService) RegisterUser(ctx context.Context, req *authv1.RegisterUserRequest) (*authv1.RegisterUserResponse, error) {
	handle := strings.ToLower(strings.TrimSpace(req.GetHandle()))
	if !handleRegex.MatchString(handle) {
		return nil, status.Error(codes.InvalidArgument, "handle: must be 3-30 chars starting with a lowercase letter")
	}

	var preID uuid.UUID
	if req.GetUserId() != "" {
		parsed, err := uuid.Parse(req.GetUserId())
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
		}
		preID = parsed
	}

	userID, err := s.pg.RegisterUser(ctx, preID, handle)
	if err != nil {
		// Postgres unique violations on handle bubble up; we surface them as AlreadyExists.
		if strings.Contains(err.Error(), "23505") {
			return nil, status.Error(codes.AlreadyExists, "handle taken")
		}
		slog.ErrorContext(ctx, "register user failed", "err", err)
		return nil, status.Error(codes.Internal, "register user failed")
	}

	if s.events != nil {
		if err := s.events.EmitUserRegistered(ctx, eventbus.UserRegistered{
			UserID:      userID.String(),
			Handle:      handle,
			DisplayName: req.GetDisplayName(),
		}); err != nil {
			// Outbox pattern lands in Phase 4; for Phase 3 we accept a log line
			// + best-effort emit on the synchronous path. The DB write is committed
			// regardless so the user still exists; profile materialization just
			// won't fire until we add the outbox or a retry sweep.
			slog.WarnContext(ctx, "user registered event emit failed", "user_id", userID, "err", err)
		}
	}

	return &authv1.RegisterUserResponse{UserId: userID.String()}, nil
}
