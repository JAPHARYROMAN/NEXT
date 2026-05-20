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
	"github.com/next-ecosystem/next/services/analytics-service/internal/api"
	"github.com/next-ecosystem/next/services/analytics-service/internal/clickhouse"
	"github.com/next-ecosystem/next/services/analytics-service/internal/config"
	"github.com/next-ecosystem/next/services/analytics-service/internal/consumer"
	analyticskafka "github.com/next-ecosystem/next/services/analytics-service/internal/kafka"
	analyticsmetrics "github.com/next-ecosystem/next/services/analytics-service/internal/metrics"
)

const (
	serviceName      = "analytics-service"
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

	metrics := analyticsmetrics.New()
	writer := clickhouse.NewHTTPWriter(clickhouse.Config{
		URL:      cfg.ClickHouseURL,
		Database: cfg.ClickHouseDB,
		Username: cfg.ClickHouseUser,
		Password: cfg.ClickHousePass,
	})
	dlqProducer := analyticskafka.NewProducer(cfg.Brokers(), "analytics-service-dlq")
	defer func() { _ = dlqProducer.Close() }()
	processor := consumer.NewProcessor(writer, dlqProducer, metrics)
	runner := consumer.NewRunner(cfg.Brokers(), cfg.KafkaGroupID, cfg.Topics(), processor, metrics)

	httpAPI := api.New(writer, metrics)
	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           otelhttp.NewHandler(httpAPI.Routes(), serviceName),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 2)
	go func() { errCh <- httpServer.ListenAndServe() }()
	go func() { errCh <- runner.Run(ctx) }()

	slog.Info("analytics-service started", "http", cfg.HTTPAddr, "group", cfg.KafkaGroupID, "topics", cfg.Topics())
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
