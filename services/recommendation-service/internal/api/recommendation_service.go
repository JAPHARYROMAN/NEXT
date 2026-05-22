// Package api implements the recommendation-service gRPC handlers. It is a thin
// adapter: it converts proto, runs the domain funnel, and persists the slate.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	recommendationv1 "github.com/next-ecosystem/next/gen/go/recommendation/v1"
	"github.com/next-ecosystem/next/services/recommendation-service/internal/domain"
	"github.com/next-ecosystem/next/services/recommendation-service/internal/store"
)

// RecommendationService implements recommendation.v1.RecommendationService.
type RecommendationService struct {
	recommendationv1.UnimplementedRecommendationServiceServer
	pg *store.Postgres
}

// NewRecommendationService constructs the handler.
func NewRecommendationService(pg *store.Postgres) *RecommendationService {
	return &RecommendationService{pg: pg}
}

// Recommend runs the four-stage funnel over the supplied candidates, persists
// the served slate, and returns it.
func (s *RecommendationService) Recommend(ctx context.Context, req *recommendationv1.RecommendRequest) (*recommendationv1.RecommendResponse, error) {
	if _, err := uuid.Parse(req.GetUserId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if _, err := uuid.Parse(req.GetSessionId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}

	hint := -1.0
	if h := req.GetAppetiteHint(); h > 0 {
		hint = h
	}
	result := domain.Recommend(domain.Request{
		Candidates:   toDomainCandidates(req.GetCandidates()),
		Signals:      toDomainSignals(req.GetSignals()),
		Limit:        int(req.GetLimit()),
		AppetiteHint: hint,
	})

	slateID, err := s.pg.SaveSlate(ctx, toStoreSlate(req, result))
	if err != nil {
		return nil, status.Error(codes.Internal, "persisting slate failed")
	}

	return &recommendationv1.RecommendResponse{
		SlateId:   slateID,
		Mode:      string(result.Mode),
		Appetite:  result.Appetite,
		Items:     toProtoItems(result.Items),
		Diversity: toProtoMetrics(result.Metrics),
	}, nil
}

// RecordFeedback persists a client feedback signal against a served slate.
func (s *RecommendationService) RecordFeedback(ctx context.Context, req *recommendationv1.RecordFeedbackRequest) (*recommendationv1.RecordFeedbackResponse, error) {
	if _, err := uuid.Parse(req.GetSlateId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "slate_id must be a uuid")
	}
	if !validFeedbackKind(req.GetKind()) {
		return nil, status.Error(codes.InvalidArgument, "unknown feedback kind")
	}
	if err := s.pg.RecordFeedback(ctx, req.GetSlateId(), req.GetContentId(), req.GetKind(), req.GetDwellMs()); err != nil {
		return nil, status.Error(codes.Internal, "recording feedback failed")
	}
	return &recommendationv1.RecordFeedbackResponse{}, nil
}

// GetSlate returns a previously served slate — for replay and "why this".
func (s *RecommendationService) GetSlate(ctx context.Context, req *recommendationv1.GetSlateRequest) (*recommendationv1.GetSlateResponse, error) {
	if _, err := uuid.Parse(req.GetSlateId()); err != nil {
		return nil, status.Error(codes.InvalidArgument, "slate_id must be a uuid")
	}
	sl, err := s.pg.GetSlate(ctx, req.GetSlateId())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "slate not found")
		}
		return nil, status.Error(codes.Internal, "get slate failed")
	}
	return &recommendationv1.GetSlateResponse{
		SlateId: sl.ID,
		UserId:  sl.UserID,
		Mode:    sl.Mode,
		Items:   storeItemsToProto(sl.Items),
		Diversity: &recommendationv1.DiversityMetrics{
			ExplorationShare: sl.ExplorationShare,
			CreatorGini:      sl.CreatorGini,
			TopicEntropy:     sl.TopicEntropy,
			DistinctCreators: uint32(sl.DistinctCreators),
			MaxCreatorShare:  sl.MaxCreatorShare,
		},
		CreatedAt: timestamppb.New(sl.CreatedAt),
	}, nil
}

func validFeedbackKind(k string) bool {
	switch k {
	case "impression", "click", "skip", "complete", "hide":
		return true
	default:
		return false
	}
}

func toDomainCandidates(in []*recommendationv1.Candidate) []domain.Candidate {
	out := make([]domain.Candidate, 0, len(in))
	for _, c := range in {
		srcs := make([]domain.Source, 0, len(c.GetSources()))
		for _, s := range c.GetSources() {
			srcs = append(srcs, domain.Source(s))
		}
		out = append(out, domain.Candidate{
			ContentID:       c.GetContentId(),
			CreatorID:       c.GetCreatorId(),
			Sources:         srcs,
			PopularityPrior: c.GetPopularityPrior(),
			AgeHours:        c.GetAgeHours(),
			Affinity:        c.GetAffinity(),
			Topic:           c.GetTopic(),
			Aesthetic:       c.GetAesthetic(),
			Intensity:       c.GetIntensity(),
		})
	}
	return out
}

func toDomainSignals(s *recommendationv1.SessionSignals) domain.SessionSignals {
	if s == nil {
		return domain.SessionSignals{}
	}
	return domain.SessionSignals{
		SessionLengthMs:        s.GetSessionLengthMs(),
		SkipRate:               s.GetSkipRate(),
		RewatchCount:           int(s.GetRewatchCount()),
		SearchDrivenEntry:      s.GetSearchDrivenEntry(),
		DwellVariance:          s.GetDwellVariance(),
		MsSinceNovelEngagement: s.GetMsSinceNovelEngagement(),
		Fatigue:                s.GetFatigue(),
	}
}

func toProtoItems(items []domain.Scored) []*recommendationv1.ScoredItem {
	out := make([]*recommendationv1.ScoredItem, len(items))
	for i, it := range items {
		srcs := make([]string, 0, len(it.Sources))
		for _, s := range it.Sources {
			srcs = append(srcs, string(s))
		}
		out[i] = &recommendationv1.ScoredItem{
			ContentId:       it.ContentID,
			CreatorId:       it.CreatorID,
			Position:        it.Position,
			Relevance:       it.Relevance,
			Novelty:         it.Novelty,
			DiversityMargin: it.DiversityMargin,
			FinalScore:      it.FinalScore,
			Exploration:     it.Exploration,
			Sources:         srcs,
		}
	}
	return out
}

func toProtoMetrics(m domain.Metrics) *recommendationv1.DiversityMetrics {
	return &recommendationv1.DiversityMetrics{
		ExplorationShare: m.ExplorationShare,
		CreatorGini:      m.CreatorGini,
		TopicEntropy:     m.TopicEntropy,
		DistinctCreators: uint32(m.DistinctCreators),
		MaxCreatorShare:  m.MaxCreatorShare,
	}
}

func toStoreSlate(req *recommendationv1.RecommendRequest, r domain.Result) store.Slate {
	items := make([]store.SlateItem, len(r.Items))
	for i, it := range r.Items {
		srcs := make([]string, 0, len(it.Sources))
		for _, s := range it.Sources {
			srcs = append(srcs, string(s))
		}
		items[i] = store.SlateItem{
			Position:        int(it.Position),
			ContentID:       it.ContentID,
			CreatorID:       it.CreatorID,
			Relevance:       it.Relevance,
			Novelty:         it.Novelty,
			DiversityMargin: it.DiversityMargin,
			FinalScore:      it.FinalScore,
			Exploration:     it.Exploration,
			Sources:         srcs,
		}
	}
	return store.Slate{
		UserID:           req.GetUserId(),
		SessionID:        req.GetSessionId(),
		Surface:          req.GetSurface(),
		Mode:             string(r.Mode),
		Appetite:         r.Appetite,
		ExplorationShare: r.Metrics.ExplorationShare,
		CreatorGini:      r.Metrics.CreatorGini,
		TopicEntropy:     r.Metrics.TopicEntropy,
		MaxCreatorShare:  r.Metrics.MaxCreatorShare,
		Items:            items,
	}
}

func storeItemsToProto(items []store.SlateItem) []*recommendationv1.ScoredItem {
	out := make([]*recommendationv1.ScoredItem, len(items))
	for i, it := range items {
		out[i] = &recommendationv1.ScoredItem{
			ContentId:       it.ContentID,
			CreatorId:       it.CreatorID,
			Position:        uint32(it.Position),
			Relevance:       it.Relevance,
			Novelty:         it.Novelty,
			DiversityMargin: it.DiversityMargin,
			FinalScore:      it.FinalScore,
			Exploration:     it.Exploration,
			Sources:         it.Sources,
		}
	}
	return out
}
