package resolver

import (
	"context"
	"errors"
	"fmt"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
	"github.com/next-ecosystem/next/services/api-gateway/internal/gql/model"
)

func (r *Resolver) tryFetchProfile(ctx context.Context, userID string, wait time.Duration) (*model.User, error) {
	deadline := time.Now().Add(wait)
	for {
		resp, err := r.Profiles.Get(ctx, &profilev1.GetRequest{UserId: userID})
		if err == nil {
			return toGQLUser(resp.GetProfile()), nil
		}
		if s, ok := status.FromError(err); ok && s.Code() == codes.NotFound {
			if wait == 0 || time.Now().After(deadline) {
				return nil, nil
			}
			select {
			case <-ctx.Done():
				return nil, nil
			case <-time.After(100 * time.Millisecond):
				continue
			}
		}
		return nil, translateGRPCError(err)
	}
}

func toGQLUser(p *profilev1.Profile) *model.User {
	if p == nil {
		return nil
	}
	u := &model.User{
		ID:          p.GetUserId(),
		Handle:      p.GetHandle(),
		DisplayName: p.GetDisplayName(),
		Bio:         p.GetBio(),
		Tier:        toGQLTier(p.GetTier()),
		Followers:   int(p.GetFollowers()),
		Following:   int(p.GetFollowing()),
	}
	if t := p.GetCreatedAt(); t != nil {
		u.CreatedAt = t.AsTime()
	}
	if t := p.GetUpdatedAt(); t != nil {
		u.UpdatedAt = t.AsTime()
	}
	return u
}

func toGQLTier(t profilev1.Tier) model.Tier {
	switch t {
	case profilev1.Tier_TIER_CREATOR:
		return model.TierCreator
	case profilev1.Tier_TIER_PARTNER:
		return model.TierPartner
	case profilev1.Tier_TIER_STAFF:
		return model.TierStaff
	default:
		return model.TierAuthenticated
	}
}

func toFollowersConnection(edges []*profilev1.FollowEdge, next string) *model.FollowersConnection {
	out := &model.FollowersConnection{Edges: make([]*model.FollowEdge, 0, len(edges))}
	if next != "" {
		out.NextCursor = &next
	}
	for _, e := range edges {
		fe := &model.FollowEdge{UserID: e.GetUserId(), Handle: e.GetHandle()}
		if t := e.GetFollowedAt(); t != nil {
			fe.FollowedAt = t.AsTime()
		}
		out.Edges = append(out.Edges, fe)
	}
	return out
}

func translateGRPCError(err error) error {
	if err == nil {
		return nil
	}
	if s, ok := status.FromError(err); ok {
		switch s.Code() {
		case codes.InvalidArgument:
			return fmt.Errorf("invalid input: %s", s.Message())
		case codes.NotFound:
			return errors.New("not found")
		case codes.AlreadyExists:
			return errors.New(s.Message())
		case codes.Unauthenticated:
			return errors.New("unauthenticated")
		case codes.PermissionDenied:
			return errors.New("forbidden")
		}
	}
	return errors.New("internal error")
}

func derefString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func derefInt32(p *int, dflt int32) int32 {
	if p == nil {
		return dflt
	}
	return int32(*p)
}
