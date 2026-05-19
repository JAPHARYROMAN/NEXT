// Command server is the profile-service entrypoint. See ../auth-service/cmd/server/main.go
// for the canonical boot sequence; this file mirrors it with service-specific wiring.
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
	"google.golang.org/grpc"

	"github.com/next-ecosystem/next/packages/go/telemetry"
)

const serviceName = "profile-service"

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
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
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

	shutdown, err := telemetry.Init(ctx, telemetry.Config{
		Service: serviceName, Namespace: "next-identity",
		Environment: cfg.Env, Version: cfg.Version, OTLPEndpoint: cfg.OTLPEndpoint,
	})
	if err != nil {
		return err
	}
	defer func() {
		c, x := context.WithTimeout(context.Background(), 5*time.Second)
		defer x()
		_ = shutdown(c)
	}()

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.Recoverer)
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(200) })
	r.Get("/readyz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(200) })

	httpSrv := &http.Server{Addr: cfg.HTTPAddr, Handler: r, ReadHeaderTimeout: 5 * time.Second}
	grpcSrv := grpc.NewServer()
	lis, err := net.Listen("tcp", cfg.GRPCAddr)
	if err != nil {
		return err
	}

	errCh := make(chan error, 2)
	go func() { errCh <- httpSrv.ListenAndServe() }()
	go func() { errCh <- grpcSrv.Serve(lis) }()
	slog.Info("started", "service", serviceName)

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
