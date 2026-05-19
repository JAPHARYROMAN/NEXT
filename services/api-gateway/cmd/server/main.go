// Command server is the api-gateway entrypoint.
//
// Exposes a single GraphQL endpoint at POST /graphql and a GraphQL Playground
// at GET /graphql (dev only). Translates GraphQL operations to gRPC calls
// against auth-service and profile-service.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/caarlos0/env/v11"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	authv1 "github.com/next-ecosystem/next/gen/go/auth/v1"
	profilev1 "github.com/next-ecosystem/next/gen/go/profile/v1"
	"github.com/next-ecosystem/next/packages/go/telemetry"
	"github.com/next-ecosystem/next/services/api-gateway/internal/authz"
	"github.com/next-ecosystem/next/services/api-gateway/internal/gql/generated"
	"github.com/next-ecosystem/next/services/api-gateway/internal/gql/resolver"
)

const (
	serviceName      = "api-gateway"
	serviceNamespace = "next-platform"
)

var version = "0.0.0-dev"

type config struct {
	Env          string `env:"NEXT_ENV" envDefault:"dev"`
	HTTPAddr     string `env:"HTTP_ADDR" envDefault:":8080"`
	OTLPEndpoint string `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
	AuthGRPC     string `env:"AUTH_GRPC_ADDR" envDefault:"localhost:17070"`
	ProfileGRPC  string `env:"PROFILE_GRPC_ADDR" envDefault:"localhost:17071"`
	EnablePlayground bool `env:"ENABLE_PLAYGROUND" envDefault:"true"`
	CORSOrigins  string `env:"CORS_ORIGINS" envDefault:"http://localhost:3000"`
	JWTIssuer    string `env:"JWT_ISSUER" envDefault:"https://auth.next.local"`
	JWTAudience  string `env:"JWT_AUDIENCE" envDefault:"next-api"`
	JWKSURI      string `env:"JWKS_URI" envDefault:"http://localhost:18080/.well-known/jwks.json"`
}

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))
	if err := run(); err != nil {
		slog.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg := config{}
	if err := env.Parse(&cfg); err != nil {
		return err
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	shutdownTel, err := telemetry.Init(ctx, telemetry.Config{
		Service: serviceName, Namespace: serviceNamespace,
		Environment: cfg.Env, Version: version, OTLPEndpoint: cfg.OTLPEndpoint,
	})
	if err != nil {
		return err
	}
	defer func() {
		c, x := context.WithTimeout(context.Background(), 5*time.Second)
		defer x()
		_ = shutdownTel(c)
	}()

	authConn, err := grpc.NewClient("passthrough:///"+cfg.AuthGRPC, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer authConn.Close()

	profileConn, err := grpc.NewClient("passthrough:///"+cfg.ProfileGRPC, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer profileConn.Close()

	rsv := &resolver.Resolver{
		AuthUsers:   authv1.NewUserServiceClient(authConn),
		Profiles:    profilev1.NewProfileServiceClient(profileConn),
		SocialGraph: profilev1.NewSocialGraphServiceClient(profileConn),
	}

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: rsv}))

	var ready atomic.Bool
	ready.Store(true) // gateway has no dependencies to probe at startup beyond gRPC dials (already done).

	jwtMW, err := authz.New(authz.Config{
		Issuer:   cfg.JWTIssuer,
		Audience: cfg.JWTAudience,
		JWKSURI:  cfg.JWKSURI,
	})
	if err != nil {
		slog.Warn("jwt middleware init failed; continuing without auth verification", "err", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer, middleware.Compress(5))
	r.Use(corsMiddleware(cfg.CORSOrigins))
	if jwtMW != nil {
		r.Use(jwtMW)
	}

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) {
		if !ready.Load() {
			http.Error(w, "warming up", http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ready"))
	})

	r.Handle("/graphql", srv)
	if cfg.EnablePlayground {
		r.Handle("/playground", playground.Handler("NEXT", "/graphql"))
	}

	httpSrv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           otelhttp.NewHandler(r, serviceName),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() { errCh <- httpSrv.ListenAndServe() }()

	slog.Info("api-gateway started",
		"version", version,
		"http", cfg.HTTPAddr,
		"auth", cfg.AuthGRPC,
		"profile", cfg.ProfileGRPC,
		"playground", cfg.EnablePlayground,
	)

	select {
	case <-ctx.Done():
		slog.Info("shutdown signal received")
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancelShutdown()
	return httpSrv.Shutdown(shutdownCtx)
}

// corsMiddleware allows the configured origins to call the gateway from a browser.
// Comma-separated; "*" allows all (only acceptable for dev).
func corsMiddleware(originsCSV string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			origin := req.Header.Get("Origin")
			if origin != "" {
				w.Header().Set("Vary", "Origin")
				if originsCSV == "*" || containsCSV(originsCSV, origin) {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
					w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
					w.Header().Set("Access-Control-Max-Age", "86400")
				}
			}
			if req.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, req)
		})
	}
}

func containsCSV(csv, target string) bool {
	for csv != "" {
		var part string
		idx := indexComma(csv)
		if idx < 0 {
			part = csv
			csv = ""
		} else {
			part = csv[:idx]
			csv = csv[idx+1:]
		}
		for len(part) > 0 && part[0] == ' ' {
			part = part[1:]
		}
		for len(part) > 0 && part[len(part)-1] == ' ' {
			part = part[:len(part)-1]
		}
		if part == target {
			return true
		}
	}
	return false
}

func indexComma(s string) int {
	for i := 0; i < len(s); i++ {
		if s[i] == ',' {
			return i
		}
	}
	return -1
}
