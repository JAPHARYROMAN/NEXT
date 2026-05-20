module github.com/next-ecosystem/next/services/media-metadata-service

go 1.25.0

replace (
	github.com/next-ecosystem/next/gen/go => ../../gen/go
	github.com/next-ecosystem/next/packages/go/eventbus => ../../packages/go/eventbus
	github.com/next-ecosystem/next/packages/go/telemetry => ../../packages/go/telemetry
)
