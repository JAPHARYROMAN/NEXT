// Package api implements the feed-service gRPC handlers. It is a thin adapter:
// it converts proto, runs the orchestration domain, and persists session state.
package api

import (
	"context"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	feedv1 "github.com/next-ecosystem/next/gen/go/feed/v1"
	"github.com/next-ecosystem/next/services/feed-service/internal/domain"
	"github.com/next-ecosystem/next/services/feed-service/internal/store"
)

// FeedService implements feed.v1.FeedService.
type FeedService struct {
	feedv1.UnimplementedFeedServiceServer
	pg *store.Postgres
}

// NewFeedService constructs the handler.
func NewFeedService(pg *store.Postgres) *FeedService { return &FeedService{pg: pg} }

// GetFeed assembles a feed page from a ranked slate: it deduplicates against
// the session, paginates, advances cross-page fatigue, and persists state.
func (s *FeedService) GetFeed(ctx context.Context, req *feedv1.GetFeedRequest) (*feedv1.GetFeedResponse, error) {
	if _, err := uuid.Parse(req.GetUserId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if _, err := uuid.Parse(req.GetSessionId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}

	sess, err := s.pg.LoadSession(ctx, req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.Internal, "loading session failed")
	}
	if sess.UserID == "" {
		sess.UserID = req.GetUserId()
		sess.Surface = req.GetSurface()
	}

	ranked := toDomainRanked(req.GetRanked())
	page := domain.AssemblePage(ranked, sess.Seen, domain.DecodeCursor(req.GetCursor()), int(req.GetLimit()))

	fatigue := domain.PageFatigue(sess.Fatigue, domain.AvgIntensity(ranked), 0)
	sess.PageCount++
	sess.Fatigue = fatigue

	served := make([]string, len(page.Items))
	items := make([]*feedv1.FeedItem, len(page.Items))
	for i, it := range page.Items {
		served[i] = it.ContentID
		items[i] = &feedv1.FeedItem{
			ContentId:   it.ContentID,
			CreatorId:   it.CreatorID,
			Position:    uint32(it.Position),
			Score:       it.Score,
			Exploration: it.Exploration,
		}
	}
	if err := s.pg.SaveSession(ctx, sess, served); err != nil {
		return nil, status.Error(codes.Internal, "persisting session failed")
	}

	return &feedv1.GetFeedResponse{
		Items:      items,
		NextCursor: page.NextCursor,
		HasMore:    page.HasMore,
		Fatigue:    fatigue,
		Breathe:    domain.ShouldBreathe(fatigue),
	}, nil
}

// RecordImpression logs a feed impression and marks the content seen.
func (s *FeedService) RecordImpression(ctx context.Context, req *feedv1.RecordImpressionRequest) (*feedv1.RecordImpressionResponse, error) {
	if _, err := uuid.Parse(req.GetUserId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if _, err := uuid.Parse(req.GetSessionId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	if !validImpressionKind(req.GetKind()) {
		return nil, status.Error(codes.InvalidArgument, "unknown impression kind")
	}
	if err := s.pg.RecordImpression(ctx, req.GetSessionId(), req.GetUserId(),
		req.GetContentId(), req.GetKind(), req.GetDwellMs()); err != nil {
		return nil, status.Error(codes.Internal, "recording impression failed")
	}
	return &feedv1.RecordImpressionResponse{}, nil
}

// AssignExperiment returns the user's sticky arm for an experiment, assigning
// one deterministically on first request.
func (s *FeedService) AssignExperiment(ctx context.Context, req *feedv1.AssignExperimentRequest) (*feedv1.AssignExperimentResponse, error) {
	if _, err := uuid.Parse(req.GetUserId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if len(req.GetArms()) == 0 {
		return nil, status.Error(codes.InvalidArgument, "at least one arm required")
	}

	if arm, found, err := s.pg.GetAssignment(ctx, req.GetUserId(), req.GetExperimentKey()); err != nil {
		return nil, status.Error(codes.Internal, "assignment lookup failed")
	} else if found {
		return &feedv1.AssignExperimentResponse{Arm: arm, NewlyAssigned: false}, nil
	}

	arm := domain.AssignArm(req.GetUserId(), req.GetExperimentKey(), req.GetArms())
	if domain.IsHoldout(req.GetUserId()) {
		arm = "holdout"
	}
	if err := s.pg.SaveAssignment(ctx, req.GetUserId(), req.GetExperimentKey(), arm); err != nil {
		return nil, status.Error(codes.Internal, "persisting assignment failed")
	}
	return &feedv1.AssignExperimentResponse{Arm: arm, NewlyAssigned: true}, nil
}

func validImpressionKind(k string) bool {
	switch k {
	case "view", "click", "skip", "complete":
		return true
	default:
		return false
	}
}

func toDomainRanked(in []*feedv1.RankedItem) []domain.RankedItem {
	out := make([]domain.RankedItem, len(in))
	for i, r := range in {
		out[i] = domain.RankedItem{
			ContentID:   r.GetContentId(),
			CreatorID:   r.GetCreatorId(),
			Score:       r.GetScore(),
			Exploration: r.GetExploration(),
			Intensity:   r.GetIntensity(),
		}
	}
	return out
}
