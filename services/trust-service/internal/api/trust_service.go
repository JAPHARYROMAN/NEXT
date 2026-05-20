// Package api implements the trust-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	trustv1 "github.com/next-ecosystem/next/gen/go/trust/v1"
	"github.com/next-ecosystem/next/services/trust-service/internal/store"
)

var validKinds = map[string]bool{
	"creator": true, "partner": true, "organization": true,
	"public_figure": true, "official_account": true,
}

// TrustService implements trust.v1.TrustService.
type TrustService struct {
	trustv1.UnimplementedTrustServiceServer
	pg *store.Postgres
}

// NewTrustService constructs the handler.
func NewTrustService(pg *store.Postgres) *TrustService { return &TrustService{pg: pg} }

// Get returns the trust state for a user (neutral default for unknowns).
func (s *TrustService) Get(ctx context.Context, req *trustv1.GetRequest) (*trustv1.GetResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	st, err := s.pg.Get(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "trust lookup failed")
	}
	return &trustv1.GetResponse{State: toProto(st)}, nil
}

// GrantVerification grants a verification badge.
func (s *TrustService) GrantVerification(ctx context.Context, req *trustv1.GrantVerificationRequest) (*trustv1.GrantVerificationResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	grantedBy, err := uuid.Parse(req.GetGrantedBy())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "granted_by must be a uuid")
	}
	if !validKinds[req.GetKind()] {
		return nil, status.Error(codes.InvalidArgument, "unknown verification kind")
	}
	if err := s.pg.GrantVerification(ctx, userID, grantedBy, req.GetKind(), req.GetEvidence()); err != nil {
		return nil, status.Error(codes.Internal, "grant failed")
	}
	st, err := s.pg.Get(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-grant lookup failed")
	}
	return &trustv1.GrantVerificationResponse{State: toProto(st)}, nil
}

// RevokeVerification revokes a verification badge.
func (s *TrustService) RevokeVerification(ctx context.Context, req *trustv1.RevokeVerificationRequest) (*trustv1.RevokeVerificationResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if err := s.pg.RevokeVerification(ctx, userID, req.GetKind(), req.GetReason()); err != nil {
		if errors.Is(err, errors.New("not found")) || err.Error() == "not found" {
			return nil, status.Error(codes.NotFound, "verification not found")
		}
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	st, err := s.pg.Get(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-revoke lookup failed")
	}
	return &trustv1.RevokeVerificationResponse{State: toProto(st)}, nil
}

func toProto(st store.TrustState) *trustv1.TrustState {
	return &trustv1.TrustState{
		UserId:        st.UserID.String(),
		Score:         st.Score,
		Verifications: st.Verifications,
		UpdatedAt:     timestamppb.New(st.UpdatedAt),
	}
}
