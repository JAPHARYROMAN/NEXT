// Package telemetry provides a uniform OpenTelemetry bootstrap for NEXT Go services.
// Call Init at process start; defer the returned shutdown to flush exporters.
package telemetry

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.27.0"
)

// Config carries the resource attributes for the running service.
type Config struct {
	Service     string
	Namespace   string
	Environment string // dev | staging | prod | test
	Version     string
	OTLPEndpoint string // defaults to OTEL_EXPORTER_OTLP_ENDPOINT
}

// Init initializes tracing + metrics. The returned shutdown should be deferred.
func Init(ctx context.Context, cfg Config) (shutdown func(context.Context) error, err error) {
	endpoint := cfg.OTLPEndpoint
	if endpoint == "" {
		endpoint = os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	}
	if endpoint == "" {
		endpoint = "otel-collector.next-observability:4317"
	}

	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName(cfg.Service),
			semconv.ServiceNamespace(cfg.Namespace),
			semconv.ServiceVersion(cfg.Version),
			semconv.DeploymentEnvironmentName(cfg.Environment),
		),
		resource.WithFromEnv(),
		resource.WithHost(),
		resource.WithProcess(),
	)
	if err != nil {
		return nil, fmt.Errorf("resource: %w", err)
	}

	traceExp, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithEndpoint(endpoint),
		otlptracegrpc.WithInsecure(),
		// Per-request timeout — the first OTLP gRPC connect on Docker Desktop
		// can take seconds while the proxy warms up, so leave plenty of room.
		otlptracegrpc.WithTimeout(30*time.Second),
		otlptracegrpc.WithRetry(otlptracegrpc.RetryConfig{
			Enabled:         true,
			InitialInterval: 500 * time.Millisecond,
			MaxInterval:     5 * time.Second,
			MaxElapsedTime:  60 * time.Second,
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("trace exporter: %w", err)
	}
	// Sampling: 1% baseline in prod; everything outside prod so engineers see their
	// own traces during dev + integration tests without juggling env vars.
	sampler := sdktrace.ParentBased(sdktrace.TraceIDRatioBased(0.01))
	if cfg.Environment != "prod" {
		sampler = sdktrace.ParentBased(sdktrace.AlwaysSample())
	}
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExp, sdktrace.WithMaxQueueSize(2048)),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(sampler),
	)
	otel.SetTracerProvider(tp)

	// W3C trace context propagation. Producers inject; consumers extract.
	// Without this every service is in its own trace island.
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	metricExp, err := otlpmetricgrpc.New(ctx,
		otlpmetricgrpc.WithEndpoint(endpoint),
		otlpmetricgrpc.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("metric exporter: %w", err)
	}
	mp := metric.NewMeterProvider(
		metric.WithReader(metric.NewPeriodicReader(metricExp, metric.WithInterval(30*time.Second))),
		metric.WithResource(res),
	)
	otel.SetMeterProvider(mp)

	return func(ctx context.Context) error {
		if err := tp.Shutdown(ctx); err != nil {
			return err
		}
		return mp.Shutdown(ctx)
	}, nil
}
