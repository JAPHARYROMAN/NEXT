module github.com/next-ecosystem/next/services/feed-service

go 1.23

require (
	github.com/next-ecosystem/next/packages/go/database v0.0.0
	github.com/next-ecosystem/next/packages/go/eventbus v0.0.0
	github.com/next-ecosystem/next/packages/go/telemetry v0.0.0
	github.com/caarlos0/env/v11 v11.2.2
	github.com/redis/go-redis/v9 v9.7.0
)

replace (
	github.com/next-ecosystem/next/packages/go/database => ../../packages/go/database
	github.com/next-ecosystem/next/packages/go/eventbus => ../../packages/go/eventbus
	github.com/next-ecosystem/next/packages/go/telemetry => ../../packages/go/telemetry
)
