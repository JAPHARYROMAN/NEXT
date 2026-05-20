package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caarlos0/env/v11"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"github.com/next-ecosystem/next/packages/go/telemetry"
	"github.com/next-ecosystem/next/services/event-gateway/internal/config"
	"github.com/next-ecosystem/next/services/event-gateway/internal/gateway"
	"github.com/next-ecosystem/next/services/event-gateway/internal/kafka"
	gatewaymetrics "github.com/next-ecosystem/next/services/event-gateway/internal/metrics"
	"github.com/next-ecosystem/next/services/event-gateway/internal/ratelimit"
	"github.com/next-ecosystem/next/services/event-gateway/internal/security"
)

const (
	serviceName      = "event-gateway"
	serviceNamespace = "next-events"
)

var version = "0.0.0-dev"

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))
	if err := run(); err != nil {
		slog.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	cfg := config.Config{}
	if err := env.Parse(&cfg); err != nil {
		return err
	}
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

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
		c, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = shutdownTelemetry(c)
	}()

	authenticator, err := security.NewAuthenticator(cfg.ProducerSecrets, cfg.AllowUnsignedEvents)
	if err != nil {
		return err
	}

	producer := kafka.NewProducer(cfg.Brokers(), cfg.KafkaClientID)
	defer func() { _ = producer.Close() }()

	server := gateway.New(gateway.Config{
		Publisher:     producer,
		Authenticator: authenticator,
		Limiter:       ratelimit.New(cfg.RateLimitPerMinute, cfg.RateLimitBurst),
		Idempotency:   gateway.NewMemoryIdempotencyStore(24 * time.Hour),
		Metrics:       gatewaymetrics.New(),
		MaxBodyBytes:  cfg.MaxBodyBytes,
	})

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           otelhttp.NewHandler(server.Routes(), serviceName),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() { errCh <- httpServer.ListenAndServe() }()

	slog.Info("event-gateway started", "http", cfg.HTTPAddr, "version", version, "env", cfg.Env)
	select {
	case <-ctx.Done():
		slog.Info("shutdown signal received")
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	return httpServer.Shutdown(shutdownCtx)
}
