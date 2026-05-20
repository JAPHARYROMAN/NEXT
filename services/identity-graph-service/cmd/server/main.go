// Command server is the identity-graph-service entrypoint.
//
// Phase 6 backs the graph with an in-memory store. Phase 8 swaps in Neo4j
// behind the same graph.Graph interface (per ADR 0023).
package main

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"google.golang.org/grpc"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"

	identitygraphv1 "github.com/next-ecosystem/next/gen/go/identitygraph/v1"
	"github.com/next-ecosystem/next/packages/go/telemetry"
	"github.com/next-ecosystem/next/services/identity-graph-service/internal/api"
	"github.com/next-ecosystem/next/services/identity-graph-service/internal/graph"
)

const (
	serviceName      = "identity-graph-service"
	serviceNamespace = "next-identity"
)

var version = "0.0.0-dev"

type config struct {
	Env          string `env:"NEXT_ENV" envDefault:"dev"`
	HTTPAddr     string `env:"HTTP_ADDR" envDefault:":8080"`
	GRPCAddr     string `env:"GRPC_ADDR" envDefault:":7070"`
	OTLPEndpoint string `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
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

	g := graph.New()

	grpcSrv := grpc.NewServer(grpc.StatsHandler(otelgrpc.NewServerHandler()))
	identitygraphv1.RegisterGraphServiceServer(grpcSrv, api.NewGraphService(g))
	healthpb.RegisterHealthServer(grpcSrv, &grpcHealth{})

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer)
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) })
	httpSrv := &http.Server{
		Addr: cfg.HTTPAddr, Handler: otelhttp.NewHandler(r, serviceName),
		ReadHeaderTimeout: 5 * time.Second,
	}

	grpcLis, err := net.Listen("tcp", cfg.GRPCAddr)
	if err != nil {
		return err
	}
	errCh := make(chan error, 2)
	go func() { errCh <- httpSrv.ListenAndServe() }()
	go func() { errCh <- grpcSrv.Serve(grpcLis) }()
	slog.Info(serviceName+" started", "version", version, "http", cfg.HTTPAddr, "grpc", cfg.GRPCAddr)

	select {
	case <-ctx.Done():
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}
	sc, x := context.WithTimeout(context.Background(), 30*time.Second)
	defer x()
	_ = httpSrv.Shutdown(sc)
	grpcSrv.GracefulStop()
	return nil
}

type grpcHealth struct{ healthpb.UnimplementedHealthServer }

func (h *grpcHealth) Check(_ context.Context, _ *healthpb.HealthCheckRequest) (*healthpb.HealthCheckResponse, error) {
	return &healthpb.HealthCheckResponse{Status: healthpb.HealthCheckResponse_SERVING}, nil
}
