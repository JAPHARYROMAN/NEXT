module github.com/next-ecosystem/next/scripts/e2e-register

go 1.25.0

require (
	github.com/next-ecosystem/next/gen/go v0.0.0
	google.golang.org/grpc v1.81.1
)

require (
	golang.org/x/net v0.52.0 // indirect
	golang.org/x/sys v0.42.0 // indirect
	golang.org/x/text v0.35.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260406210006-6f92a3bedf2d // indirect
	google.golang.org/protobuf v1.36.11 // indirect
)

replace github.com/next-ecosystem/next/gen/go => ../../gen/go
