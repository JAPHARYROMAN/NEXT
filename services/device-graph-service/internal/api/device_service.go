// Package api implements the device-graph-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"

	devicegraphv1 "github.com/next-ecosystem/next/gen/go/devicegraph/v1"
	"github.com/next-ecosystem/next/services/device-graph-service/internal/store"
)

// DeviceService implements devicegraph.v1.DeviceService.
type DeviceService struct {
	devicegraphv1.UnimplementedDeviceServiceServer
	pg *store.Postgres
}

// NewDeviceService constructs the handler.
func NewDeviceService(pg *store.Postgres) *DeviceService { return &DeviceService{pg: pg} }

// Register records a device sign-in and computes a fresh risk score.
func (s *DeviceService) Register(ctx context.Context, req *devicegraphv1.RegisterRequest) (*devicegraphv1.RegisterResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	d, countries, err := s.pg.Upsert(ctx, store.Device{
		UserID:        userID,
		Fingerprint:   req.GetFingerprint(),
		Platform:      defaultStr(req.GetPlatform(), "unknown"),
		UserAgent:     req.GetUserAgent(),
		LastIPCountry: req.GetIpCountry(),
	})
	if err != nil {
		return nil, status.Error(codes.Internal, "register failed")
	}
	score := riskScore(d, countries)
	if score != d.RiskScore {
		_ = s.pg.SetRiskScore(ctx, d.ID, score)
		d.RiskScore = score
	}
	return &devicegraphv1.RegisterResponse{Device: toProto(d)}, nil
}

// Score recomputes the risk score for a known device.
func (s *DeviceService) Score(ctx context.Context, req *devicegraphv1.ScoreRequest) (*devicegraphv1.ScoreResponse, error) {
	id, err := uuid.Parse(req.GetDeviceId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "device_id must be a uuid")
	}
	d, err := s.pg.Get(ctx, id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "device not found")
		}
		return nil, status.Error(codes.Internal, "score lookup failed")
	}
	return &devicegraphv1.ScoreResponse{RiskScore: int32(d.RiskScore), Band: band(d.RiskScore)}, nil
}

// List returns a user's devices.
func (s *DeviceService) List(ctx context.Context, req *devicegraphv1.ListRequest) (*devicegraphv1.ListResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	devices, err := s.pg.List(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "list failed")
	}
	out := make([]*devicegraphv1.Device, len(devices))
	for i, d := range devices {
		out[i] = toProto(d)
	}
	return &devicegraphv1.ListResponse{Devices: out}, nil
}

// Revoke marks a device revoked.
func (s *DeviceService) Revoke(ctx context.Context, req *devicegraphv1.RevokeRequest) (*devicegraphv1.RevokeResponse, error) {
	id, err := uuid.Parse(req.GetDeviceId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "device_id must be a uuid")
	}
	if err := s.pg.Revoke(ctx, id); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "device not found")
		}
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	return &devicegraphv1.RevokeResponse{}, nil
}

// riskScore is a transparent heuristic for Phase 6. Phase 8 swaps in the
// trained anomaly model. Signals:
//   - revoked device → max risk
//   - many distinct sign-in countries → escalating risk (travelling or shared)
//   - trusted state → risk floor lowered
func riskScore(d store.Device, distinctCountries int) int {
	if d.State == "revoked" {
		return 100
	}
	score := 50 // unverified baseline
	if d.State == "trusted" {
		score = 15
	}
	switch {
	case distinctCountries >= 5:
		score += 40
	case distinctCountries >= 3:
		score += 25
	case distinctCountries == 2:
		score += 10
	}
	if score > 100 {
		score = 100
	}
	return score
}

func band(score int) string {
	switch {
	case score >= 70:
		return "high"
	case score >= 40:
		return "medium"
	default:
		return "low"
	}
}

func toProto(d store.Device) *devicegraphv1.Device {
	return &devicegraphv1.Device{
		Id:            d.ID.String(),
		UserId:        d.UserID.String(),
		Platform:      d.Platform,
		Fingerprint:   d.Fingerprint,
		UserAgent:     d.UserAgent,
		State:         d.State,
		LastIpCountry: d.LastIPCountry,
		RiskScore:     int32(d.RiskScore),
		FirstSeenAt:   timestamppb.New(d.FirstSeenAt),
		LastSeenAt:    timestamppb.New(d.LastSeenAt),
	}
}

func defaultStr(v, dflt string) string {
	if v == "" {
		return dflt
	}
	return v
}
