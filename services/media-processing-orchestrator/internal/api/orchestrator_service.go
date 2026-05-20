// Package api implements the orchestrator gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	orchestratorv1 "github.com/next-ecosystem/next/gen/go/orchestrator/v1"
	"github.com/next-ecosystem/next/services/media-processing-orchestrator/internal/saga"
	"github.com/next-ecosystem/next/services/media-processing-orchestrator/internal/store"
)

// OrchestratorService implements orchestrator.v1.OrchestratorService.
type OrchestratorService struct {
	orchestratorv1.UnimplementedOrchestratorServiceServer
	pg *store.Postgres
}

// NewOrchestratorService constructs the handler.
func NewOrchestratorService(pg *store.Postgres) *OrchestratorService {
	return &OrchestratorService{pg: pg}
}

// StartRun opens a pipeline run for an ingested video.
func (s *OrchestratorService) StartRun(ctx context.Context, req *orchestratorv1.StartRunRequest) (*orchestratorv1.StartRunResponse, error) {
	videoID, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	run, err := s.pg.StartRun(ctx, videoID, req.GetSourceKey())
	if err != nil {
		return nil, status.Error(codes.Internal, "start run failed")
	}
	return &orchestratorv1.StartRunResponse{Run: toProto(run)}, nil
}

// GetRun returns the pipeline run for a video.
func (s *OrchestratorService) GetRun(ctx context.Context, req *orchestratorv1.GetRunRequest) (*orchestratorv1.GetRunResponse, error) {
	videoID, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	run, err := s.pg.GetByVideo(ctx, videoID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "no pipeline run for this video")
		}
		return nil, status.Error(codes.Internal, "get run failed")
	}
	return &orchestratorv1.GetRunResponse{Run: toProto(run)}, nil
}

// ReportStage records a stage outcome and advances the saga.
func (s *OrchestratorService) ReportStage(ctx context.Context, req *orchestratorv1.ReportStageRequest) (*orchestratorv1.ReportStageResponse, error) {
	videoID, err := uuid.Parse(req.GetVideoId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "video_id must be a uuid")
	}
	if !saga.IsKnown(req.GetStage()) {
		return nil, status.Error(codes.InvalidArgument, "unknown stage")
	}
	if req.GetStatus() != "succeeded" && req.GetStatus() != "failed" {
		return nil, status.Error(codes.InvalidArgument, "status must be succeeded or failed")
	}
	run, complete, failed, err := s.pg.ReportStage(ctx, videoID, req.GetStage(), req.GetStatus(), req.GetDetail())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "no pipeline run for this video")
		}
		return nil, status.Error(codes.Internal, "report stage failed")
	}
	return &orchestratorv1.ReportStageResponse{
		Run: toProto(run), RunComplete: complete, RunFailed: failed,
	}, nil
}

func toProto(r store.Run) *orchestratorv1.PipelineRun {
	out := &orchestratorv1.PipelineRun{
		Id:        r.ID.String(),
		VideoId:   r.VideoID.String(),
		State:     r.State,
		StartedAt: timestamppb.New(r.StartedAt),
	}
	for _, st := range r.Stages {
		out.Stages = append(out.Stages, &orchestratorv1.StageStatus{
			Stage: st.Stage, Status: st.Status,
			Attempts: int32(st.Attempts), Detail: st.Detail,
		})
	}
	return out
}
