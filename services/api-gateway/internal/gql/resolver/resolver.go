package resolver

import (
	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
)

// Resolver holds the gRPC clients used by every field resolver.
//
// Dependency injection: cmd/server/main.go wires the gRPC connections and
// passes them in. Resolvers fan out to the right backend service.
type Resolver struct {
	AuthUsers   authv1.UserServiceClient
	Profiles    profilev1.ProfileServiceClient
	SocialGraph profilev1.SocialGraphServiceClient
}
