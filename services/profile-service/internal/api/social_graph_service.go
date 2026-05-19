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

// SocialGraphService implements profile.v1.SocialGraphService.
type SocialGraphService struct {
	profilev1.UnimplementedSocialGraphServiceServer

	pg     *store.Postgres
	events *eventbus.Producer
}

// NewSocialGraphService constructs the handler.
func NewSocialGraphService(pg *store.Postgres, ev *eventbus.Producer) *SocialGraphService {
	return &SocialGraphService{pg: pg, events: ev}
}

// Follow creates an edge follower -> followee. Idempotent on the pair.
func (s *SocialGraphService) Follow(ctx context.Context, req *profilev1.FollowRequest) (*profilev1.FollowResponse, error) {
	follower, followee, err := parsePair(req.GetFollowerId(), req.GetFolloweeId())
	if err != nil {
		return nil, err
	}
	if err := s.pg.Follow(ctx, follower, followee); err != nil {
		switch {
		case errors.Is(err, domain.ErrSelfFollow):
			return nil, status.Error(codes.InvalidArgument, "cannot follow self")
		case errors.Is(err, store.ErrAlreadyFollowing):
			// Idempotent: success without emitting a duplicate event.
			return &profilev1.FollowResponse{}, nil
		default:
			return nil, status.Error(codes.Internal, "follow failed")
		}
	}
	if s.events != nil {
		_ = s.events.EmitFollow(ctx, follower, followee)
	}
	return &profilev1.FollowResponse{}, nil
}

// Unfollow removes the edge. No-op if it didn't exist.
func (s *SocialGraphService) Unfollow(ctx context.Context, req *profilev1.UnfollowRequest) (*profilev1.UnfollowResponse, error) {
	follower, followee, err := parsePair(req.GetFollowerId(), req.GetFolloweeId())
	if err != nil {
		return nil, err
	}
	if err := s.pg.Unfollow(ctx, follower, followee); err != nil {
		return nil, status.Error(codes.Internal, "unfollow failed")
	}
	if s.events != nil {
		_ = s.events.EmitUnfollow(ctx, follower, followee)
	}
	return &profilev1.UnfollowResponse{}, nil
}

// Followers — paginated list of users following userID.
func (s *SocialGraphService) Followers(ctx context.Context, req *profilev1.FollowersRequest) (*profilev1.FollowersResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	edges, next, err := s.pg.ListFollowers(ctx, userID, int(req.GetLimit()), req.GetAfter())
	if err != nil {
		return nil, status.Error(codes.Internal, "list followers failed")
	}
	return &profilev1.FollowersResponse{
		Edges:      edgesToProto(edges),
		NextCursor: next,
	}, nil
}

// Following — paginated list of users that userID follows.
func (s *SocialGraphService) Following(ctx context.Context, req *profilev1.FollowingRequest) (*profilev1.FollowingResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	edges, next, err := s.pg.ListFollowing(ctx, userID, int(req.GetLimit()), req.GetAfter())
	if err != nil {
		return nil, status.Error(codes.Internal, "list following failed")
	}
	return &profilev1.FollowingResponse{
		Edges:      edgesToProto(edges),
		NextCursor: next,
	}, nil
}

func parsePair(followerStr, followeeStr string) (uuid.UUID, uuid.UUID, error) {
	follower, err := uuid.Parse(followerStr)
	if err != nil {
		return uuid.Nil, uuid.Nil, status.Error(codes.InvalidArgument, "follower_id must be a uuid")
	}
	followee, err := uuid.Parse(followeeStr)
	if err != nil {
		return uuid.Nil, uuid.Nil, status.Error(codes.InvalidArgument, "followee_id must be a uuid")
	}
	return follower, followee, nil
}

func edgesToProto(edges []store.FollowEdge) []*profilev1.FollowEdge {
	out := make([]*profilev1.FollowEdge, len(edges))
	for i, e := range edges {
		out[i] = &profilev1.FollowEdge{
			UserId:     e.UserID.String(),
			Handle:     e.Handle,
			FollowedAt: timestamppb.New(e.CreatedAt),
		}
	}
	return out
}
