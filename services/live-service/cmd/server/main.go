// Command server is the live-service scaffold runtime entrypoint.
// It exposes health/readiness while the Go live control plane is implemented.
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

	"github.com/next-ecosystem/next/packages/go/telemetry"
)

const (
	serviceName      = "live-service"
	serviceNamespace = "next-streaming"
)

var (
	version = "0.0.0-dev"
	commit  = "unknown"
)

type config struct {
	Env             string        `env:"NEXT_ENV" envDefault:"dev"`
	HTTPAddr        string        `env:"HTTP_ADDR" envDefault:":8080"`
	GRPCAddr        string        `env:"GRPC_ADDR" envDefault:":7070"`
	OTLPEndpoint    string        `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
	ShutdownTimeout time.Duration `env:"SHUTDOWN_TIMEOUT" envDefault:"30s"`
}

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))
	if err := run(); err != nil {
		slog.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := loadConfig()
	if err != nil {
		return err
	}

	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	shutdownTelemetry, err := telemetry.Init(ctx, telemetry.Config{
		Service:      serviceName,
		Namespace:    serviceNamespace,
		Environment:  cfg.Env,
		Version:      version,
		OTLPEndpoint: cfg.OTLPEndpoint,
	})
	if err != nil {
		return err
	}
	defer func() {
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		_ = shutdownTelemetry(shutdownCtx)
	}()

	grpcSrv := newGRPCServer()
	httpSrv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           otelhttp.NewHandler(newHTTPHandler(), serviceName),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	grpcLis, err := net.Listen("tcp", cfg.GRPCAddr)
	if err != nil {
		return err
	}

	errCh := make(chan error, 2)
	go func() { errCh <- httpSrv.ListenAndServe() }()
	go func() { errCh <- grpcSrv.Serve(grpcLis) }()

	slog.Info(serviceName+" started",
		"version", version,
		"commit", commit,
		"http", cfg.HTTPAddr,
		"grpc", cfg.GRPCAddr,
	)

	select {
	case <-ctx.Done():
		slog.Info("shutdown signal received")
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer shutdownCancel()
	_ = httpSrv.Shutdown(shutdownCtx)
	stopGRPC(shutdownCtx, grpcSrv)
	return nil
}

func loadConfig() (config, error) {
	cfg := config{}
	if err := env.Parse(&cfg); err != nil {
		return config{}, err
	}
	return cfg, nil
}

func newHTTPHandler() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer)
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	return r
}

func newGRPCServer() *grpc.Server {
	grpcSrv := grpc.NewServer(grpc.StatsHandler(otelgrpc.NewServerHandler()))
	healthpb.RegisterHealthServer(grpcSrv, &grpcHealth{})
	return grpcSrv
}

func stopGRPC(ctx context.Context, grpcSrv *grpc.Server) {
	stopped := make(chan struct{})
	go func() {
		grpcSrv.GracefulStop()
		close(stopped)
	}()
	select {
	case <-stopped:
	case <-ctx.Done():
		grpcSrv.Stop()
	}
}

type grpcHealth struct {
	healthpb.UnimplementedHealthServer
}

func (h *grpcHealth) Check(_ context.Context, _ *healthpb.HealthCheckRequest) (*healthpb.HealthCheckResponse, error) {
	return &healthpb.HealthCheckResponse{Status: healthpb.HealthCheckResponse_SERVING}, nil
}
