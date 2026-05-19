module github.com/next-ecosystem/next/services/upload-service

go 1.23

require (
	github.com/next-ecosystem/next/packages/go/database v0.0.0
	github.com/next-ecosystem/next/packages/go/eventbus v0.0.0
	github.com/next-ecosystem/next/packages/go/telemetry v0.0.0

	github.com/aws/aws-sdk-go-v2/service/s3 v1.66.0
	github.com/caarlos0/env/v11 v11.2.2
	github.com/tus/tusd/v2 v2.5.0
)

replace (
	github.com/next-ecosystem/next/packages/go/database => ../../packages/go/database
	github.com/next-ecosystem/next/packages/go/eventbus => ../../packages/go/eventbus
	github.com/next-ecosystem/next/packages/go/telemetry => ../../packages/go/telemetry
)
