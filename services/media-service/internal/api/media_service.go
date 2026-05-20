// Package api implements the media-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	mediav1 "github.com/next-ecosystem/next/gen/go/media/v1"
	"github.com/next-ecosystem/next/services/media-service/internal/domain"
	"github.com/next-ecosystem/next/services/media-service/internal/store"
)

// MediaService implements media.v1.MediaService.
type MediaService struct {
	mediav1.UnimplementedMediaServiceServer
	pg *store.Postgres
}

// NewMediaService constructs the handler.
func NewMediaService(pg *store.Postgres) *MediaService { return &MediaService{pg: pg} }

// Ingest creates a Video in the `ingested` state from an uploaded source object.
func (s *MediaService) Ingest(ctx context.Context, req *mediav1.IngestRequest) (*mediav1.IngestResponse, error) {
	creatorID, err := uuid.Parse(req.GetCreatorId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "creator_id must be a uuid")
	}
	v, err := s.pg.Ingest(ctx, creatorID, req.GetTitle(), req.GetSourceKey())
	if err != nil {
		return nil, status.Error(codes.Internal, "ingest failed")
	}
	full, err := s.pg.Get(ctx, v.ID)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-ingest lookup failed")
	}
	return &mediav1.IngestResponse{Video: toProto(full)}, nil
}

// Get returns a video with its renditions.
func (s *MediaService) Get(ctx context.Context, req *mediav1.GetRequest) (*mediav1.GetResponse, error) {
	id, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	v, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "video not found")
		}
		return nil, status.Error(codes.Internal, "get failed")
	}
	return &mediav1.GetResponse{Video: toProto(v)}, nil
}

// AdvanceState moves a video through the processing state machine, validating
// the transition against the domain rules.
func (s *MediaService) AdvanceState(ctx context.Context, req *mediav1.AdvanceStateRequest) (*mediav1.AdvanceStateResponse, error) {
	id, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	to := domain.State(req.GetToState())
	if !domain.IsValidState(to) {
		return nil, status.Error(codes.InvalidArgument, "unknown target state")
	}
	v, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "video not found")
		}
		return nil, status.Error(codes.Internal, "lookup failed")
	}
	if !domain.CanTransition(domain.State(v.State), to) {
		return nil, status.Errorf(codes.FailedPrecondition,
			"cannot move from %s to %s", v.State, to)
	}
	if err := s.pg.SetState(ctx, id, string(to)); err != nil {
		return nil, status.Error(codes.Internal, "state update failed")
	}
	full, err := s.pg.Get(ctx, id)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-update lookup failed")
	}
	return &mediav1.AdvanceStateResponse{Video: toProto(full)}, nil
}

// Publish makes a ready video visible.
func (s *MediaService) Publish(ctx context.Context, req *mediav1.PublishRequest) (*mediav1.PublishResponse, error) {
	id, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	v, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "video not found")
		}
		return nil, status.Error(codes.Internal, "lookup failed")
	}
	if v.State != string(domain.StateReady) && v.State != string(domain.StatePublished) {
		return nil, status.Error(codes.FailedPrecondition, "video is not ready to publish")
	}
	if err := s.pg.Publish(ctx, id, req.GetVisibility()); err != nil {
		return nil, status.Error(codes.Internal, "publish failed")
	}
	full, err := s.pg.Get(ctx, id)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-publish lookup failed")
	}
	return &mediav1.PublishResponse{Video: toProto(full)}, nil
}

// AddRendition records a transcoded variant. transcoding-service calls this as
// rungs complete.
func (s *MediaService) AddRendition(ctx context.Context, req *mediav1.AddRenditionRequest) (*mediav1.AddRenditionResponse, error) {
	id, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	r := req.GetRendition()
	if r == nil {
		return nil, status.Error(codes.InvalidArgument, "rendition required")
	}
	if err := s.pg.AddRendition(ctx, id, store.Rendition{
		Rung: r.GetRung(), Codec: r.GetCodec(), ObjectKey: r.GetObjectKey(),
		Bytes: r.GetBytes(), Width: r.GetWidth(), Height: r.GetHeight(),
		BitrateKbps: r.GetBitrateKbps(),
	}); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "video not found")
		}
		return nil, status.Error(codes.Internal, "add rendition failed")
	}
	full, err := s.pg.Get(ctx, id)
	if err != nil {
		return nil, status.Error(codes.Internal, "post-add lookup failed")
	}
	return &mediav1.AddRenditionResponse{Video: toProto(full)}, nil
}

// List returns a creator's videos.
func (s *MediaService) List(ctx context.Context, req *mediav1.ListRequest) (*mediav1.ListResponse, error) {
	creatorID, err := uuid.Parse(req.GetCreatorId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "creator_id must be a uuid")
	}
	videos, err := s.pg.List(ctx, creatorID, int(req.GetLimit()))
	if err != nil {
		return nil, status.Error(codes.Internal, "list failed")
	}
	out := make([]*mediav1.Video, len(videos))
	for i, v := range videos {
		out[i] = toProto(v)
	}
	return &mediav1.ListResponse{Videos: out}, nil
}

func toProto(v store.Video) *mediav1.Video {
	out := &mediav1.Video{
		Id:         v.ID.String(),
		CreatorId:  v.CreatorID.String(),
		Title:      v.Title,
		Visibility: v.Visibility,
		State:      v.State,
		SourceKey:  v.SourceKey,
		DurationMs: v.DurationMs,
		CreatedAt:  timestamppb.New(v.CreatedAt),
	}
	if v.PublishedAt != nil {
		out.PublishedAt = timestamppb.New(*v.PublishedAt)
	}
	for _, r := range v.Renditions {
		out.Renditions = append(out.Renditions, &mediav1.Rendition{
			Rung: r.Rung, Codec: r.Codec, ObjectKey: r.ObjectKey, Bytes: r.Bytes,
			Width: r.Width, Height: r.Height, BitrateKbps: r.BitrateKbps,
		})
	}
	return out
}
