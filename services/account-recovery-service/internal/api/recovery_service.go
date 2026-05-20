// Package api implements the account-recovery-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	accountrecoveryv1 "github.com/next-ecosystem/next/gen/go/accountrecovery/v1"
	"github.com/next-ecosystem/next/services/account-recovery-service/internal/store"
)

const recoveryCodeCount = 10

var validFlowKinds = map[string]bool{
	"recovery_code": true, "email": true, "trusted_contact": true,
}

// RecoveryService implements accountrecovery.v1.RecoveryService.
type RecoveryService struct {
	accountrecoveryv1.UnimplementedRecoveryServiceServer
	pg *store.Postgres
}

// NewRecoveryService constructs the handler.
func NewRecoveryService(pg *store.Postgres) *RecoveryService { return &RecoveryService{pg: pg} }

// IssueCodes mints a fresh set of single-use recovery codes.
func (s *RecoveryService) IssueCodes(ctx context.Context, req *accountrecoveryv1.IssueCodesRequest) (*accountrecoveryv1.IssueCodesResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	out, err := s.pg.IssueCodes(ctx, userID, recoveryCodeCount)
	if err != nil {
		return nil, status.Error(codes.Internal, "issue codes failed")
	}
	return &accountrecoveryv1.IssueCodesResponse{Codes: out}, nil
}

// StartFlow opens a recovery flow.
func (s *RecoveryService) StartFlow(ctx context.Context, req *accountrecoveryv1.StartFlowRequest) (*accountrecoveryv1.StartFlowResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if !validFlowKinds[req.GetKind()] {
		return nil, status.Error(codes.InvalidArgument, "unknown recovery kind")
	}
	flowID, channel, err := s.pg.StartFlow(ctx, userID, req.GetKind())
	if err != nil {
		return nil, status.Error(codes.Internal, "start flow failed")
	}
	return &accountrecoveryv1.StartFlowResponse{FlowId: flowID.String(), Channel: channel}, nil
}

// VerifyChallenge checks a supplied challenge against an open flow.
func (s *RecoveryService) VerifyChallenge(ctx context.Context, req *accountrecoveryv1.VerifyChallengeRequest) (*accountrecoveryv1.VerifyChallengeResponse, error) {
	flowID, err := uuid.Parse(req.GetFlowId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "flow_id must be a uuid")
	}
	completed, state, err := s.pg.VerifyChallenge(ctx, flowID, req.GetChallenge())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "flow not found")
		}
		return nil, status.Error(codes.Internal, "verify failed")
	}
	return &accountrecoveryv1.VerifyChallengeResponse{Completed: completed, State: state}, nil
}
