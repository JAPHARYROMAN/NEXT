// Package api implements the profile-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
	"github.com/next-ecosystem/next/services/profile-service/internal/domain"
	"github.com/next-ecosystem/next/services/profile-service/internal/eventbus"
	"github.com/next-ecosystem/next/services/profile-service/internal/store"
)

// ProfileService implements profile.v1.ProfileService.
type ProfileService struct {
	profilev1.UnimplementedProfileServiceServer

	pg     *store.Postgres
	events *eventbus.Producer
}

// NewProfileService constructs the handler.
func NewProfileService(pg *store.Postgres, ev *eventbus.Producer) *ProfileService {
	return &ProfileService{pg: pg, events: ev}
}

// Create — registers a profile after auth-service has minted a user.
func (s *ProfileService) Create(ctx context.Context, req *profilev1.CreateRequest) (*profilev1.CreateResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	handle, err := domain.NormalizeHandle(req.GetHandle())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "handle: "+err.Error())
	}

	prof, err := s.pg.CreateProfile(ctx, domain.Profile{
		UserID:      userID,
		Handle:      handle,
		DisplayName: req.GetDisplayName(),
		Tier:        domain.TierAuthenticated,
	})
	if err != nil {
		switch {
		case errors.Is(err, store.ErrHandleTaken):
			return nil, status.Error(codes.AlreadyExists, "handle taken")
		default:
			return nil, status.Error(codes.Internal, "create profile failed")
		}
	}

	if s.events != nil {
		_ = s.events.EmitProfileCreated(ctx, prof)
	}
	return &profilev1.CreateResponse{Profile: toProto(prof)}, nil
}

// Get returns a single profile.
func (s *ProfileService) Get(ctx context.Context, req *profilev1.GetRequest) (*profilev1.GetResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	prof, err := s.pg.GetProfile(ctx, userID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "profile not found")
		}
		return nil, status.Error(codes.Internal, "get profile failed")
	}
	return &profilev1.GetResponse{Profile: toProto(prof)}, nil
}

// Update patches a profile.
func (s *ProfileService) Update(ctx context.Context, req *profilev1.UpdateRequest) (*profilev1.UpdateResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}

	var handlePtr *string
	if req.Handle != nil {
		h, err := domain.NormalizeHandle(req.GetHandle())
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "handle: "+err.Error())
		}
		handlePtr = &h
	}

	prof, err := s.pg.UpdateProfile(ctx, userID, handlePtr, req.DisplayName, req.Bio)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			return nil, status.Error(codes.NotFound, "profile not found")
		case errors.Is(err, store.ErrHandleTaken):
			return nil, status.Error(codes.AlreadyExists, "handle taken")
		default:
			return nil, status.Error(codes.Internal, "update failed")
		}
	}

	if s.events != nil {
		_ = s.events.EmitProfileUpdated(ctx, prof)
	}
	return &profilev1.UpdateResponse{Profile: toProto(prof)}, nil
}

func toProto(p domain.Profile) *profilev1.Profile {
	return &profilev1.Profile{
		UserId:      p.UserID.String(),
		Handle:      p.Handle,
		DisplayName: p.DisplayName,
		Bio:         p.Bio,
		Tier:        tierToProto(p.Tier),
		Followers:   p.Followers,
		Following:   p.Following,
		CreatedAt:   timestamppb.New(p.CreatedAt),
		UpdatedAt:   timestamppb.New(p.UpdatedAt),
	}
}

func tierToProto(t domain.Tier) profilev1.Tier {
	switch t {
	case domain.TierCreator:
		return profilev1.Tier_TIER_CREATOR
	case domain.TierPartner:
		return profilev1.Tier_TIER_PARTNER
	case domain.TierStaff:
		return profilev1.Tier_TIER_STAFF
	default:
		return profilev1.Tier_TIER_AUTHENTICATED
	}
}
