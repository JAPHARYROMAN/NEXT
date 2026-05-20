// Package api implements the identity-graph-service gRPC handlers.
package api

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	identitygraphv1 "github.com/next-ecosystem/next/gen/go/identitygraph/v1"
	"github.com/next-ecosystem/next/services/identity-graph-service/internal/graph"
)

// GraphService implements identitygraph.v1.GraphService.
type GraphService struct {
	identitygraphv1.UnimplementedGraphServiceServer
	g *graph.Graph
}

// NewGraphService constructs the handler.
func NewGraphService(g *graph.Graph) *GraphService { return &GraphService{g: g} }

// Neighbors returns weighted outbound neighbors along an edge kind.
func (s *GraphService) Neighbors(_ context.Context, req *identitygraphv1.NeighborsRequest) (*identitygraphv1.NeighborsResponse, error) {
	if req.GetEdgeKind() == "" {
		return nil, status.Error(codes.InvalidArgument, "edge_kind required")
	}
	ns := s.g.Neighbors(req.GetUserId(), req.GetEdgeKind(), int(req.GetLimit()))
	out := make([]*identitygraphv1.Neighbor, len(ns))
	for i, n := range ns {
		out[i] = &identitygraphv1.Neighbor{UserId: n.UserID, Weight: n.Weight}
	}
	return &identitygraphv1.NeighborsResponse{Neighbors: out}, nil
}

// Path runs a bounded BFS along FOLLOWS edges.
func (s *GraphService) Path(_ context.Context, req *identitygraphv1.PathRequest) (*identitygraphv1.PathResponse, error) {
	hops, found := s.g.Path(req.GetFrom(), req.GetTo(), "FOLLOWS", int(req.GetMaxHops()))
	return &identitygraphv1.PathResponse{Hops: hops, Found: found}, nil
}

// UpsertEdge inserts or updates an edge. Normally driven by Kafka consumers;
// exposed directly so other services + tests can seed the graph.
func (s *GraphService) UpsertEdge(_ context.Context, req *identitygraphv1.UpsertEdgeRequest) (*identitygraphv1.UpsertEdgeResponse, error) {
	if req.GetEdgeKind() == "" {
		return nil, status.Error(codes.InvalidArgument, "edge_kind required")
	}
	w := req.GetWeight()
	if w == 0 {
		w = 1.0
	}
	s.g.UpsertEdge(req.GetFrom(), req.GetTo(), req.GetEdgeKind(), w)
	return &identitygraphv1.UpsertEdgeResponse{}, nil
}
