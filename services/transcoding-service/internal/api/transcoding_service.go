// Package api implements the transcoding-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	transcodingv1 "github.com/next-ecosystem/next/gen/go/transcoding/v1"
	"github.com/next-ecosystem/next/services/transcoding-service/internal/ladder"
	"github.com/next-ecosystem/next/services/transcoding-service/internal/store"
)

// TranscodingService implements transcoding.v1.TranscodingService.
type TranscodingService struct {
	transcodingv1.UnimplementedTranscodingServiceServer
	pg *store.Postgres
}

// NewTranscodingService constructs the handler.
func NewTranscodingService(pg *store.Postgres) *TranscodingService { return &TranscodingService{pg: pg} }

// SubmitJob queues a transcode job, computing the content-adaptive ladder.
func (s *TranscodingService) SubmitJob(ctx context.Context, req *transcodingv1.SubmitJobRequest) (*transcodingv1.SubmitJobResponse, error) {
	videoID, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	if req.GetSourceHeight() <= 0 {
		return nil, status.Error(codes.InvalidArgument, "source_height must be positive")
	}
	j, err := s.pg.Submit(ctx, videoID, req.GetSourceKey(), req.GetSourceHeight())
	if err != nil {
		return nil, status.Error(codes.Internal, "submit failed")
	}
	return &transcodingv1.SubmitJobResponse{Job: toProto(j)}, nil
}

// GetJob returns a job by ID.
func (s *TranscodingService) GetJob(ctx context.Context, req *transcodingv1.GetJobRequest) (*transcodingv1.GetJobResponse, error) {
	id, err := uuid.Parse(req.GetJobId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "job_id must be a uuid")
	}
	j, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "job not found")
		}
		return nil, status.Error(codes.Internal, "get failed")
	}
	return &transcodingv1.GetJobResponse{Job: toProto(j)}, nil
}

// ClaimNext hands the oldest queued job to a worker.
func (s *TranscodingService) ClaimNext(ctx context.Context, req *transcodingv1.ClaimNextRequest) (*transcodingv1.ClaimNextResponse, error) {
	if req.GetWorkerId() == "" {
		return nil, status.Error(codes.InvalidArgument, "worker_id required")
	}
	j, err := s.pg.ClaimNext(ctx, req.GetWorkerId())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return &transcodingv1.ClaimNextResponse{Found: false}, nil
		}
		return nil, status.Error(codes.Internal, "claim failed")
	}
	return &transcodingv1.ClaimNextResponse{Job: toProto(j), Found: true}, nil
}

// CompleteRung records a finished rung; completes the job when the ladder is done.
func (s *TranscodingService) CompleteRung(ctx context.Context, req *transcodingv1.CompleteRungRequest) (*transcodingv1.CompleteRungResponse, error) {
	id, err := uuid.Parse(req.GetJobId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "job_id must be a uuid")
	}
	if req.GetRung() == "" {
		return nil, status.Error(codes.InvalidArgument, "rung required")
	}
	j, complete, err := s.pg.CompleteRung(ctx, id, req.GetRung())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "job not found")
		}
		return nil, status.Error(codes.Internal, "complete rung failed")
	}
	return &transcodingv1.CompleteRungResponse{Job: toProto(j), JobComplete: complete}, nil
}

func toProto(j store.Job) *transcodingv1.TranscodeJob {
	out := &transcodingv1.TranscodeJob{
		Id:             j.ID.String(),
		VideoId:        j.VideoID.String(),
		SourceKey:      j.SourceKey,
		SourceHeight:   j.SourceHeight,
		State:          j.State,
		CompletedRungs: int32(len(j.CompletedRungs)),
		CreatedAt:      timestamppb.New(j.CreatedAt),
	}
	for _, r := range j.Ladder {
		out.Ladder = append(out.Ladder, rungToProto(r))
	}
	return out
}

func rungToProto(r ladder.Rung) *transcodingv1.RungSpec {
	return &transcodingv1.RungSpec{
		Name: r.Name, Width: r.Width, Height: r.Height,
		Codec: r.Codec, BitrateKbps: r.BitrateKbps,
	}
}
