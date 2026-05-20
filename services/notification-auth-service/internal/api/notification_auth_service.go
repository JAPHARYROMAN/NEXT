// Package api implements the notification-auth-service gRPC handlers.
package api

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	notificationauthv1 "github.com/next-ecosystem/next/gen/go/notificationauth/v1"
	"github.com/next-ecosystem/next/services/notification-auth-service/internal/store"
)

// NotificationAuthService implements notificationauth.v1.NotificationAuthService.
type NotificationAuthService struct {
	notificationauthv1.UnimplementedNotificationAuthServiceServer
	pg *store.Postgres
}

// NewNotificationAuthService constructs the handler.
func NewNotificationAuthService(pg *store.Postgres) *NotificationAuthService {
	return &NotificationAuthService{pg: pg}
}

// PushChallenge opens a step-up challenge. In production the approval token is
// delivered to the user's trusted device push channel; here it is returned so
// local dev + tests can complete the loop.
func (s *NotificationAuthService) PushChallenge(ctx context.Context, req *notificationauthv1.PushChallengeRequest) (*notificationauthv1.PushChallengeResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	ttl := time.Duration(req.GetTtlSeconds()) * time.Second
	id, token, err := s.pg.CreateChallenge(ctx, userID, req.GetAction(), ttl)
	if err != nil {
		return nil, status.Error(codes.Internal, "push challenge failed")
	}
	return &notificationauthv1.PushChallengeResponse{
		ChallengeId:   id.String(),
		ApprovalToken: token,
	}, nil
}

// VerifyChallenge resolves a challenge from the supplied approval token.
func (s *NotificationAuthService) VerifyChallenge(ctx context.Context, req *notificationauthv1.VerifyChallengeRequest) (*notificationauthv1.VerifyChallengeResponse, error) {
	id, err := uuid.Parse(req.GetChallengeId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "challenge_id must be a uuid")
	}
	state, err := s.pg.Verify(ctx, id, req.GetApprovalToken())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return &notificationauthv1.VerifyChallengeResponse{State: "unknown"}, nil
		}
		return nil, status.Error(codes.Internal, "verify failed")
	}
	return &notificationauthv1.VerifyChallengeResponse{State: state}, nil
}

// CancelChallenge cancels a pending challenge.
func (s *NotificationAuthService) CancelChallenge(ctx context.Context, req *notificationauthv1.CancelChallengeRequest) (*notificationauthv1.CancelChallengeResponse, error) {
	id, err := uuid.Parse(req.GetChallengeId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "challenge_id must be a uuid")
	}
	if err := s.pg.Cancel(ctx, id); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "no pending challenge")
		}
		return nil, status.Error(codes.Internal, "cancel failed")
	}
	return &notificationauthv1.CancelChallengeResponse{}, nil
}
