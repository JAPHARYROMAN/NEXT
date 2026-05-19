// Package api implements the session-service gRPC handlers.
package api

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	sessionv1 "github.com/next-ecosystem/next/gen/go/session/v1"
	"github.com/next-ecosystem/next/services/session-service/internal/store"
)

// SessionService implements session.v1.SessionService.
type SessionService struct {
	sessionv1.UnimplementedSessionServiceServer

	pg *store.Postgres
}

func NewSessionService(pg *store.Postgres) *SessionService {
	return &SessionService{pg: pg}
}

func (s *SessionService) Create(ctx context.Context, req *sessionv1.CreateRequest) (*sessionv1.CreateResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	ttl := time.Duration(req.GetTtlSeconds()) * time.Second
	sess, raw, err := s.pg.Create(ctx, userID, req.GetMethod(), req.GetDeviceId(), req.GetIpCountry(), req.GetUserAgent(), ttl)
	if err != nil {
		return nil, status.Error(codes.Internal, "create session failed")
	}
	return &sessionv1.CreateResponse{Session: toProto(sess), RefreshToken: raw}, nil
}

func (s *SessionService) Validate(ctx context.Context, req *sessionv1.ValidateRequest) (*sessionv1.ValidateResponse, error) {
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	sess, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "validate failed")
	}
	revoked := sess.RevokedAt != nil
	expired := time.Now().After(sess.ExpiresAt)
	return &sessionv1.ValidateResponse{Session: toProto(sess), Revoked: revoked, Expired: expired}, nil
}

func (s *SessionService) Refresh(ctx context.Context, req *sessionv1.RefreshRequest) (*sessionv1.RefreshResponse, error) {
	sess, raw, theft, err := s.pg.Refresh(ctx, req.GetRefreshToken())
	if err != nil {
		switch {
		case errors.Is(err, store.ErrTokenReused):
			return &sessionv1.RefreshResponse{TheftDetected: true}, status.Error(codes.Unauthenticated, "token reuse detected; family revoked")
		case errors.Is(err, store.ErrTokenExpired):
			return nil, status.Error(codes.Unauthenticated, "refresh token expired")
		case errors.Is(err, store.ErrNotFound):
			return nil, status.Error(codes.NotFound, "refresh token not found")
		default:
			return nil, status.Error(codes.Internal, "refresh failed")
		}
	}
	_ = theft
	return &sessionv1.RefreshResponse{Session: toProto(sess), RefreshToken: raw}, nil
}

func (s *SessionService) Revoke(ctx context.Context, req *sessionv1.RevokeRequest) (*sessionv1.RevokeResponse, error) {
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	if err := s.pg.Revoke(ctx, id); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	return &sessionv1.RevokeResponse{}, nil
}

func (s *SessionService) List(ctx context.Context, req *sessionv1.ListRequest) (*sessionv1.ListResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	rows, err := s.pg.ListActive(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "list failed")
	}
	out := &sessionv1.ListResponse{Sessions: make([]*sessionv1.Session, len(rows))}
	for i, r := range rows {
		out.Sessions[i] = toProto(r)
	}
	return out, nil
}

func toProto(s store.Session) *sessionv1.Session {
	p := &sessionv1.Session{
		Id:        s.ID.String(),
		UserId:    s.UserID.String(),
		FamilyId:  s.FamilyID.String(),
		Method:    s.Method,
		DeviceId:  s.DeviceID,
		IpCountry: s.IPCountry,
		UserAgent: s.UserAgent,
		StartedAt: timestamppb.New(s.StartedAt),
		LastActiveAt: timestamppb.New(s.LastActiveAt),
		ExpiresAt: timestamppb.New(s.ExpiresAt),
	}
	if s.RevokedAt != nil {
		p.RevokedAt = timestamppb.New(*s.RevokedAt)
	}
	return p
}
