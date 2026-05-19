module github.com/next-ecosystem/next/services/auth-service

go 1.23

require (
	github.com/next-ecosystem/next/packages/go/auth v0.0.0
	github.com/next-ecosystem/next/packages/go/database v0.0.0
	github.com/next-ecosystem/next/packages/go/eventbus v0.0.0
	github.com/next-ecosystem/next/packages/go/telemetry v0.0.0

	github.com/caarlos0/env/v11 v11.2.2
	github.com/go-chi/chi/v5 v5.1.0
	github.com/jackc/pgx/v5 v5.7.1
	github.com/redis/go-redis/v9 v9.7.0
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.56.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.56.0
	google.golang.org/grpc v1.67.1
	google.golang.org/grpc/health v0.0.0-00010101000000-000000000000
)

replace (
	github.com/next-ecosystem/next/packages/go/auth => ../../packages/go/auth
	github.com/next-ecosystem/next/packages/go/database => ../../packages/go/database
	github.com/next-ecosystem/next/packages/go/eventbus => ../../packages/go/eventbus
	github.com/next-ecosystem/next/packages/go/telemetry => ../../packages/go/telemetry
)
