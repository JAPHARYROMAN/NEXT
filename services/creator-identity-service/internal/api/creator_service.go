// Package api implements the creator-identity-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	creatoridentityv1 "github.com/next-ecosystem/next/gen/go/creatoridentity/v1"
	"github.com/next-ecosystem/next/services/creator-identity-service/internal/store"
)

// CreatorService implements creatoridentity.v1.CreatorService.
type CreatorService struct {
	creatoridentityv1.UnimplementedCreatorServiceServer
	pg *store.Postgres
}

// NewCreatorService constructs the handler.
func NewCreatorService(pg *store.Postgres) *CreatorService { return &CreatorService{pg: pg} }

// Upgrade promotes a user to creator tier.
func (s *CreatorService) Upgrade(ctx context.Context, req *creatoridentityv1.UpgradeRequest) (*creatoridentityv1.UpgradeResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	c, err := s.pg.Upgrade(ctx, userID, req.GetDisplayName())
	if err != nil {
		return nil, status.Error(codes.Internal, "upgrade failed")
	}
	return &creatoridentityv1.UpgradeResponse{Creator: toProto(c)}, nil
}

// GetCreator returns a creator record.
func (s *CreatorService) GetCreator(ctx context.Context, req *creatoridentityv1.GetCreatorRequest) (*creatoridentityv1.GetCreatorResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	c, err := s.pg.Get(ctx, userID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "not a creator")
		}
		return nil, status.Error(codes.Internal, "lookup failed")
	}
	return &creatoridentityv1.GetCreatorResponse{Creator: toProto(c)}, nil
}

// StartVerification opens a KYC workflow.
func (s *CreatorService) StartVerification(ctx context.Context, req *creatoridentityv1.StartVerificationRequest) (*creatoridentityv1.StartVerificationResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	workflowID, err := s.pg.StartVerification(ctx, userID, req.GetKind())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.FailedPrecondition, "user must be a creator first")
		}
		return nil, status.Error(codes.Internal, "start verification failed")
	}
	return &creatoridentityv1.StartVerificationResponse{WorkflowId: workflowID.String()}, nil
}

// GetVerificationStatus returns the creator's KYC state.
func (s *CreatorService) GetVerificationStatus(ctx context.Context, req *creatoridentityv1.GetVerificationStatusRequest) (*creatoridentityv1.GetVerificationStatusResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	state, err := s.pg.VerificationStatus(ctx, userID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "not a creator")
		}
		return nil, status.Error(codes.Internal, "status lookup failed")
	}
	return &creatoridentityv1.GetVerificationStatusResponse{KycState: state}, nil
}

func toProto(c store.Creator) *creatoridentityv1.Creator {
	return &creatoridentityv1.Creator{
		UserId:      c.UserID.String(),
		DisplayName: c.DisplayName,
		KycState:    c.KYCState,
		PayoutReady: c.PayoutReady,
		UpgradedAt:  timestamppb.New(c.UpgradedAt),
	}
}
