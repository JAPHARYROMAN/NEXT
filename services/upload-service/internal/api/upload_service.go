// Package api implements the upload-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	uploadv1 "github.com/next-ecosystem/next/gen/go/upload/v1"
	"github.com/next-ecosystem/next/services/upload-service/internal/blob"
	"github.com/next-ecosystem/next/services/upload-service/internal/store"
)

// UploadService implements upload.v1.UploadService.
type UploadService struct {
	uploadv1.UnimplementedUploadServiceServer
	pg   *store.Postgres
	blob *blob.Store
}

// NewUploadService constructs the handler.
func NewUploadService(pg *store.Postgres, b *blob.Store) *UploadService {
	return &UploadService{pg: pg, blob: b}
}

// CreateSession opens a resumable upload session.
func (s *UploadService) CreateSession(ctx context.Context, req *uploadv1.CreateSessionRequest) (*uploadv1.CreateSessionResponse, error) {
	creatorID, err := uuid.Parse(req.GetCreatorId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "creator_id must be a uuid")
	}
	if req.GetTotalBytes() <= 0 {
		return nil, status.Error(codes.InvalidArgument, "total_bytes must be positive")
	}
	sess, err := s.pg.CreateSession(ctx, store.Session{
		CreatorID:   creatorID,
		ContentType: req.GetContentType(),
		Filename:    req.GetFilename(),
		TotalBytes:  req.GetTotalBytes(),
	})
	if err != nil {
		return nil, status.Error(codes.Internal, "create session failed")
	}
	return &uploadv1.CreateSessionResponse{Session: toProto(sess)}, nil
}

// PutChunk stores one chunk at a byte offset. Chunks may arrive out of order.
func (s *UploadService) PutChunk(ctx context.Context, req *uploadv1.PutChunkRequest) (*uploadv1.PutChunkResponse, error) {
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	sess, err := s.pg.GetSession(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "session lookup failed")
	}
	if sess.State != "open" {
		return nil, status.Error(codes.FailedPrecondition, "session is not open")
	}
	if req.GetOffset()+int64(len(req.GetData())) > sess.TotalBytes {
		return nil, status.Error(codes.InvalidArgument, "chunk exceeds declared total size")
	}

	if err := s.blob.PutChunk(id.String(), req.GetOffset(), req.GetData()); err != nil {
		return nil, status.Error(codes.Internal, "chunk write failed")
	}
	committed, err := s.pg.RecordPart(ctx, id, req.GetOffset(), int64(len(req.GetData())))
	if err != nil {
		return nil, status.Error(codes.Internal, "record part failed")
	}
	return &uploadv1.PutChunkResponse{CommittedBytes: committed}, nil
}

// GetSession returns session state — clients use committed_bytes to resume.
func (s *UploadService) GetSession(ctx context.Context, req *uploadv1.GetSessionRequest) (*uploadv1.GetSessionResponse, error) {
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	sess, err := s.pg.GetSession(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "session lookup failed")
	}
	return &uploadv1.GetSessionResponse{Session: toProto(sess)}, nil
}

// Finalize assembles the chunks into a single object once all bytes are present.
func (s *UploadService) Finalize(ctx context.Context, req *uploadv1.FinalizeRequest) (*uploadv1.FinalizeResponse, error) {
	id, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "session_id must be a uuid")
	}
	sess, err := s.pg.GetSession(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "session not found")
		}
		return nil, status.Error(codes.Internal, "session lookup failed")
	}
	if sess.State == "completed" {
		return &uploadv1.FinalizeResponse{ObjectKey: sess.ObjectKey, TotalBytes: sess.TotalBytes}, nil
	}
	if sess.CommittedBytes != sess.TotalBytes {
		return nil, status.Errorf(codes.FailedPrecondition,
			"upload incomplete: %d of %d bytes", sess.CommittedBytes, sess.TotalBytes)
	}

	objectKey, total, err := s.blob.Assemble(id.String())
	if err != nil {
		return nil, status.Error(codes.Internal, "assembly failed")
	}
	if err := s.pg.MarkCompleted(ctx, id, objectKey); err != nil {
		return nil, status.Error(codes.Internal, "finalize bookkeeping failed")
	}
	return &uploadv1.FinalizeResponse{ObjectKey: objectKey, TotalBytes: total}, nil
}

func toProto(s store.Session) *uploadv1.UploadSession {
	return &uploadv1.UploadSession{
		Id:             s.ID.String(),
		CreatorId:      s.CreatorID.String(),
		ContentType:    s.ContentType,
		TotalBytes:     s.TotalBytes,
		CommittedBytes: s.CommittedBytes,
		State:          s.State,
		ObjectKey:      s.ObjectKey,
		CreatedAt:      timestamppb.New(s.CreatedAt),
	}
}
