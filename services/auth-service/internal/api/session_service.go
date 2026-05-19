// Package api holds the gRPC + HTTP handlers for auth-service.
package api

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/domain"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
)

// SessionService implements auth.v1.SessionService.
type SessionService struct {
	authv1.UnimplementedSessionServiceServer

	pg    *store.Postgres
	rd    *store.Redis
	clock func() time.Time
}

// NewSessionService constructs the gRPC handler.
func NewSessionService(pg *store.Postgres, rd *store.Redis) *SessionService {
	return &SessionService{pg: pg, rd: rd, clock: time.Now}
}

// Validate returns the claims bound to a session.
// Phase 1 implementation: the access_token *is* the session UUID (server-side opaque).
// Full JWT verification per [ADR 0012] will be added together with key issuance.
func (s *SessionService) Validate(ctx context.Context, req *authv1.ValidateRequest) (*authv1.ValidateResponse, error) {
	if req.GetAccessToken() == "" {
		return nil, status.Error(codes.InvalidArgument, "access_token is required")
	}
	id, err := uuid.Parse(req.GetAccessToken())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "access_token is not a valid session id")
	}

	revoked, err := s.rd.IsSessionRevoked(ctx, id.String())
	if err != nil {
		return nil, status.Error(codes.Unavailable, "revocation cache unavailable")
	}
	if revoked {
		return nil, status.Error(codes.Unauthenticated, "session revoked")
	}

	row, err := s.pg.GetSession(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "session lookup failed")
	}

	sess := domain.Session{
		ID:        row.ID,
		UserID:    row.UserID,
		FamilyID:  row.FamilyID,
		Method:    domain.Method(row.Method),
		ExpiresAt: row.ExpiresAt,
		RevokedAt: row.RevokedAt,
	}
	if err := sess.IsActive(s.clock()); err != nil {
		return nil, status.Error(codes.Unauthenticated, err.Error())
	}

	return &authv1.ValidateResponse{
		Subject:   sess.UserID.String(),
		SessionId: sess.ID.String(),
		Tier:      authv1.Tier_TIER_AUTHENTICATED, // Phase 1: hard-coded; reads from user row in Phase 3.
		ExpiresAt: timestamppb.New(sess.ExpiresAt),
		Scopes:    nil,
	}, nil
}

// Revoke marks a session as revoked.
func (s *SessionService) Revoke(ctx context.Context, req *authv1.RevokeRequest) (*authv1.RevokeResponse, error) {
	if req.GetSessionId() == "" {
		return nil, status.Error(codes.InvalidArgument, "session_id is required")
	}
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id is not a uuid")
	}
	if err := s.pg.RevokeSession(ctx, id); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	if err := s.rd.MarkSessionRevoked(ctx, id.String(), 24*time.Hour); err != nil {
		// Postgres is authoritative; Redis is a hot-path optimisation.
		// Failing to set the cache is non-fatal but logged by the interceptor.
		return nil, status.Error(codes.Internal, "revoke cache update failed")
	}
	return &authv1.RevokeResponse{}, nil
}

// Refresh — Phase 1 stub. Full refresh-token rotation lands with the OIDC ceremonies.
func (s *SessionService) Refresh(ctx context.Context, _ *authv1.RefreshRequest) (*authv1.RefreshResponse, error) {
	return nil, status.Error(codes.Unimplemented, "refresh implemented in Phase 3 with OIDC code path")
}
