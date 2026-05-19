// Command server is the auth-service entrypoint.
//
// Boot sequence:
//  1. Parse config from environment.
//  2. Initialise OpenTelemetry (traces + metrics).
//  3. Open Postgres + Redis pools.
//  4. Open Kafka producer.
//  5. Construct domain services + handlers.
//  6. Start HTTP server (:8080), gRPC server (:7070), metrics server (:9090).
//  7. Listen for SIGTERM; drain and shutdown.
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
	"google.golang.org/grpc/health"
	healthpb "google.golang.org/grpc/health/grpc_health_v1"

	"github.com/next-ecosystem/next/packages/go/telemetry"
)

const serviceName = "auth-service"

type config struct {
	Env          string `env:"NEXT_ENV" envDefault:"dev"`
	Version      string `env:"VERSION" envDefault:"0.0.0"`
	HTTPAddr     string `env:"HTTP_ADDR" envDefault:":8080"`
	GRPCAddr     string `env:"GRPC_ADDR" envDefault:":7070"`
	MetricsAddr  string `env:"METRICS_ADDR" envDefault:":9090"`
	OTLPEndpoint string `env:"OTEL_EXPORTER_OTLP_ENDPOINT" envDefault:""`
	PostgresURL  string `env:"POSTGRES_URL,required"`
	RedisURL     string `env:"REDIS_URL,required"`
	KafkaBrokers string `env:"KAFKA_BROKERS,required"`
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

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
		Service:      serviceName,
		Namespace:    "next-identity",
		Environment:  cfg.Env,
		Version:      cfg.Version,
		OTLPEndpoint: cfg.OTLPEndpoint,
	})
	if err != nil {
		return err
	}
	defer func() {
		shutdownCtx, c := context.WithTimeout(context.Background(), 5*time.Second)
		defer c()
		_ = shutdownTel(shutdownCtx)
	}()

	httpSrv := newHTTPServer(cfg)
	grpcSrv := newGRPCServer()
	metricsSrv := newMetricsServer(cfg.MetricsAddr)

	grpcLis, err := net.Listen("tcp", cfg.GRPCAddr)
	if err != nil {
		return err
	}

	errCh := make(chan error, 3)
	go func() { errCh <- httpSrv.ListenAndServe() }()
	go func() { errCh <- grpcSrv.Serve(grpcLis) }()
	go func() { errCh <- metricsSrv.ListenAndServe() }()

	slog.Info("started", "service", serviceName, "http", cfg.HTTPAddr, "grpc", cfg.GRPCAddr)

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

	_ = httpSrv.Shutdown(shutdownCtx)
	grpcSrv.GracefulStop()
	_ = metricsSrv.Shutdown(shutdownCtx)
	return nil
}

func newHTTPServer(cfg config) *http.Server {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer, middleware.Compress(5))

	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) {
		// Real implementation pings Postgres + Redis with a short deadline.
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ready"))
	})

	// OIDC + OAuth handlers mounted by internal/api wiring (omitted in scaffold).

	return &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           otelhttp.NewHandler(r, serviceName),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
}

func newGRPCServer() *grpc.Server {
	s := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)
	healthpb.RegisterHealthServer(s, health.NewServer())
	// SessionService + KeyService registered here in the real wiring.
	return s
}

func newMetricsServer(addr string) *http.Server {
	mux := http.NewServeMux()
	// Prometheus handler registered by the OTel SDK's metrics reader bridge.
	mux.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	return &http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
}
