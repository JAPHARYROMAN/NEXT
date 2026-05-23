// Package api holds the gRPC + HTTP handlers for auth-service.
package api

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	"github.com/next-ecosystem/next/services/auth-service/internal/domain"
	"github.com/next-ecosystem/next/services/auth-service/internal/store"
	"github.com/next-ecosystem/next/services/auth-service/internal/tokens"
)

// SessionService implements auth.v1.SessionService.
type SessionService struct {
	authv1.UnimplementedSessionServiceServer

	sessions    sessionStore
	revocations revocationCache
	verifier    accessTokenVerifier
	clock       func() time.Time
}

type sessionStore interface {
	GetSession(context.Context, uuid.UUID) (store.Session, error)
	RevokeSession(context.Context, uuid.UUID) error
}

type revocationCache interface {
	IsSessionRevoked(context.Context, string) (bool, error)
	MarkSessionRevoked(context.Context, string, time.Duration) error
}

type accessTokenVerifier interface {
	Verify(string) (*tokens.Claims, error)
}

// NewSessionService constructs the gRPC handler.
func NewSessionService(pg *store.Postgres, rd *store.Redis, verifier *tokens.Issuer) *SessionService {
	var tokenVerifier accessTokenVerifier
	if verifier != nil {
		tokenVerifier = verifier
	}
	return &SessionService{sessions: pg, revocations: rd, verifier: tokenVerifier, clock: time.Now}
}

// Validate returns the claims bound to a session.
// Access tokens are RS256 JWTs containing a sid claim. Postgres remains
// authoritative for session activity; Redis is the fast revocation cache.
func (s *SessionService) Validate(ctx context.Context, req *authv1.ValidateRequest) (*authv1.ValidateResponse, error) {
	accessToken := strings.TrimSpace(req.GetAccessToken())
	if accessToken == "" {
		return nil, status.Error(codes.InvalidArgument, "access_token is required")
	}

	if s.verifier != nil {
		claims, err := s.verifier.Verify(accessToken)
		if err != nil {
			return nil, status.Error(codes.Unauthenticated, "access_token invalid")
		}
		if claims.Subject == "" {
			return nil, status.Error(codes.Unauthenticated, "subject missing")
		}
		if claims.SessionID == "" {
			return nil, status.Error(codes.Unauthenticated, "session id missing")
		}
		return s.validateSession(ctx, claims.Subject, claims.SessionID, tierFromClaim(claims.Next.Tier))
	}

	id, err := uuid.Parse(accessToken)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "access_token is not a valid session id")
	}
	return s.validateSession(ctx, "", id.String(), authv1.Tier_TIER_AUTHENTICATED)
}

func (s *SessionService) validateSession(ctx context.Context, subject, sessionID string, tier authv1.Tier) (*authv1.ValidateResponse, error) {
	id, err := uuid.Parse(sessionID)
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "session id invalid")
	}
	revoked, err := s.revocations.IsSessionRevoked(ctx, id.String())
	if err != nil {
		return nil, status.Error(codes.Unavailable, "revocation cache unavailable")
	}
	if revoked {
		return nil, status.Error(codes.Unauthenticated, "session revoked")
	}

	row, err := s.sessions.GetSession(ctx, id)
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
	if subject != "" && subject != sess.UserID.String() {
		return nil, status.Error(codes.Unauthenticated, "subject/session mismatch")
	}
	if tier == authv1.Tier_TIER_UNSPECIFIED {
		tier = authv1.Tier_TIER_AUTHENTICATED
	}

	return &authv1.ValidateResponse{
		Subject:   sess.UserID.String(),
		SessionId: sess.ID.String(),
		Tier:      tier,
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
	if err := s.sessions.RevokeSession(ctx, id); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	if err := s.revocations.MarkSessionRevoked(ctx, id.String(), 24*time.Hour); err != nil {
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

func tierFromClaim(tier string) authv1.Tier {
	switch domain.Tier(tier) {
	case domain.TierAnonymous:
		return authv1.Tier_TIER_ANONYMOUS
	case domain.TierAuthenticated:
		return authv1.Tier_TIER_AUTHENTICATED
	case domain.TierCreator:
		return authv1.Tier_TIER_CREATOR
	case domain.TierPartner:
		return authv1.Tier_TIER_PARTNER
	case domain.TierStaff:
		return authv1.Tier_TIER_STAFF
	default:
		return authv1.Tier_TIER_UNSPECIFIED
	}
}
