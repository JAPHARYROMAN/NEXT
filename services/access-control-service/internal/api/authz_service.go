// Package api implements the access-control-service gRPC handlers.
package api

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	accesscontrolv1 "github.com/next-ecosystem/next/gen/go/accesscontrol/v1"
	"github.com/next-ecosystem/next/services/access-control-service/internal/scopes"
	"github.com/next-ecosystem/next/services/access-control-service/internal/store"
)

// AuthzService implements accesscontrol.v1.AuthzService — the policy decision point.
type AuthzService struct {
	accesscontrolv1.UnimplementedAuthzServiceServer
	pg *store.Postgres
}

// NewAuthzService constructs the handler.
func NewAuthzService(pg *store.Postgres) *AuthzService { return &AuthzService{pg: pg} }

// Authorize returns allow/deny for a (subject, scope) pair.
// Decision = tier default scopes ∪ scopes from the subject's role bindings.
func (s *AuthzService) Authorize(ctx context.Context, req *accesscontrolv1.AuthorizeRequest) (*accesscontrolv1.AuthorizeResponse, error) {
	if scopes.TierGrants(req.GetSubjectTier(), req.GetScope()) {
		return &accesscontrolv1.AuthorizeResponse{
			Allow:  true,
			Reason: "tier:" + req.GetSubjectTier(),
		}, nil
	}

	userID, err := uuid.Parse(req.GetSubjectId())
	if err != nil {
		return &accesscontrolv1.AuthorizeResponse{Allow: false, Reason: "subject_id not a uuid"}, nil
	}
	granted, err := s.pg.ScopesForUser(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "scope lookup failed")
	}
	if _, ok := granted[req.GetScope()]; ok {
		return &accesscontrolv1.AuthorizeResponse{Allow: true, Reason: "role_binding"}, nil
	}
	return &accesscontrolv1.AuthorizeResponse{Allow: false, Reason: "no_grant"}, nil
}

// Roles lists the roles bound to a user.
func (s *AuthzService) Roles(ctx context.Context, req *accesscontrolv1.RolesRequest) (*accesscontrolv1.RolesResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	roles, err := s.pg.RolesForUser(ctx, userID)
	if err != nil {
		return nil, status.Error(codes.Internal, "roles lookup failed")
	}
	return &accesscontrolv1.RolesResponse{Roles: roles}, nil
}

// GrantRole binds a role to a user.
func (s *AuthzService) GrantRole(ctx context.Context, req *accesscontrolv1.GrantRoleRequest) (*accesscontrolv1.GrantRoleResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	grantedBy, err := uuid.Parse(req.GetGrantedBy())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "granted_by must be a uuid")
	}
	exists, err := s.pg.RoleExists(ctx, req.GetRole())
	if err != nil {
		return nil, status.Error(codes.Internal, "role check failed")
	}
	if !exists {
		return nil, status.Error(codes.NotFound, "role not defined")
	}
	if err := s.pg.GrantRole(ctx, userID, req.GetRole(), grantedBy); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "role not defined")
		}
		return nil, status.Error(codes.Internal, "grant failed")
	}
	return &accesscontrolv1.GrantRoleResponse{}, nil
}

// RevokeRole removes a role binding.
func (s *AuthzService) RevokeRole(ctx context.Context, req *accesscontrolv1.RevokeRoleRequest) (*accesscontrolv1.RevokeRoleResponse, error) {
	userID, err := uuid.Parse(req.GetUserId())
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "user_id must be a uuid")
	}
	if err := s.pg.RevokeRole(ctx, userID, req.GetRole()); err != nil {
		return nil, status.Error(codes.Internal, "revoke failed")
	}
	return &accesscontrolv1.RevokeRoleResponse{}, nil
}
