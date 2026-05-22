package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	healthpb "google.golang.org/grpc/health/grpc_health_v1"
)

func TestLoadConfig(t *testing.T) {
	t.Setenv("NEXT_ENV", "test")
	t.Setenv("HTTP_ADDR", ":18080")
	t.Setenv("GRPC_ADDR", ":17070")
	t.Setenv("OTEL_EXPORTER_OTLP_ENDPOINT", "otel:4317")
	t.Setenv("SHUTDOWN_TIMEOUT", "250ms")

	cfg, err := loadConfig()
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	if cfg.Env != "test" {
		t.Fatalf("Env = %q, want test", cfg.Env)
	}
	if cfg.HTTPAddr != ":18080" {
		t.Fatalf("HTTPAddr = %q, want :18080", cfg.HTTPAddr)
	}
	if cfg.GRPCAddr != ":17070" {
		t.Fatalf("GRPCAddr = %q, want :17070", cfg.GRPCAddr)
	}
	if cfg.OTLPEndpoint != "otel:4317" {
		t.Fatalf("OTLPEndpoint = %q, want otel:4317", cfg.OTLPEndpoint)
	}
	if cfg.ShutdownTimeout != 250*time.Millisecond {
		t.Fatalf("ShutdownTimeout = %s, want 250ms", cfg.ShutdownTimeout)
	}
}

func TestHealthEndpoints(t *testing.T) {
	handler := newHTTPHandler()
	for _, path := range []string{"/healthz", "/readyz"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("%s returned status %d, want %d", path, rec.Code, http.StatusOK)
		}
	}
}

func TestGRPCHealthServing(t *testing.T) {
	resp, err := (&grpcHealth{}).Check(context.Background(), &healthpb.HealthCheckRequest{})
	if err != nil {
		t.Fatalf("health check returned error: %v", err)
	}
	if resp.GetStatus() != healthpb.HealthCheckResponse_SERVING {
		t.Fatalf("health status = %s, want %s", resp.GetStatus(), healthpb.HealthCheckResponse_SERVING)
	}
}
