// Phase 3 end-to-end verifier.
//
// Calls auth-service.UserService/RegisterUser, then polls profile-service's
// ProfileService/Get until the materialized profile appears (or times out).
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
)

func main() {
	authAddr := flag.String("auth", "localhost:17070", "auth-service gRPC")
	profileAddr := flag.String("profile", "localhost:17071", "profile-service gRPC")
	handle := flag.String("handle", fmt.Sprintf("e2e_%d", time.Now().UnixNano()%1_000_000), "handle to register")
	pollTimeout := flag.Duration("timeout", 10*time.Second, "max time to wait for materialization")
	flag.Parse()

	// passthrough:/// skips DNS resolution which is otherwise tetchy for raw
	// host:port strings depending on the grpc client version.
	authConn, err := grpc.NewClient("passthrough:///"+*authAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("dial auth: %v", err)
	}
	defer func() {
		_ = authConn.Close()
	}()
	profileConn, err := grpc.NewClient("passthrough:///"+*profileAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("dial profile: %v", err)
	}
	defer func() {
		_ = profileConn.Close()
	}()

	authClient := authv1.NewUserServiceClient(authConn)
	profileClient := profilev1.NewProfileServiceClient(profileConn)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// 1. Register.
	regResp, err := authClient.RegisterUser(ctx, &authv1.RegisterUserRequest{
		Handle:      *handle,
		DisplayName: "E2E " + *handle,
	})
	if err != nil {
		log.Fatalf("RegisterUser: %v", err)
	}
	userID := regResp.GetUserId()
	fmt.Printf("registered user_id=%s handle=%s\n", userID, *handle)

	// 2. Poll profile-service.
	deadline := time.Now().Add(*pollTimeout)
	attempt := 0
	for time.Now().Before(deadline) {
		attempt++
		got, err := profileClient.Get(ctx, &profilev1.GetRequest{UserId: userID})
		if err == nil {
			fmt.Printf("OK: profile materialized after %d polls (%.1fs)\n",
				attempt, time.Since(deadline.Add(-*pollTimeout)).Seconds())
			fmt.Printf("    handle=%s display_name=%s tier=%v\n",
				got.GetProfile().GetHandle(), got.GetProfile().GetDisplayName(), got.GetProfile().GetTier())
			os.Exit(0)
		}
		if s, ok := status.FromError(err); ok && s.Code() == codes.NotFound {
			time.Sleep(250 * time.Millisecond)
			continue
		}
		log.Fatalf("Get profile (unexpected error): %v", err)
	}
	log.Fatalf("timed out after %d polls; profile never materialized for user_id=%s", attempt, userID)
}
