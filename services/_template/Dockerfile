# syntax=docker/dockerfile:1.10
# Canonical Dockerfile for NEXT Go services.
# Each service includes a one-line Dockerfile that ARGs SERVICE=<name> and inherits this.

ARG GO_VERSION=1.25.0
ARG ALPINE_VERSION=3.22
ARG BUF_VERSION=1.45.0
ARG PROTOC_GEN_GO_VERSION=v1.34.2
ARG PROTOC_GEN_GO_GRPC_VERSION=v1.5.1

FROM bufbuild/buf:${BUF_VERSION} AS buf

FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS builder
ARG PROTOC_GEN_GO_VERSION
ARG PROTOC_GEN_GO_GRPC_VERSION
WORKDIR /src
COPY --from=buf /usr/local/bin/buf /usr/local/bin/buf
COPY go.work go.work.sum ./
COPY buf.yaml buf.gen.yaml buf.gen.docker.yaml buf.lock ./
COPY gen/go/go.mod gen/go/go.sum ./gen/go/
COPY packages/go ./packages/go
COPY packages/events ./packages/events
COPY scripts/e2e-jwt ./scripts/e2e-jwt
COPY scripts/e2e-register ./scripts/e2e-register
COPY services ./services
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go install google.golang.org/protobuf/cmd/protoc-gen-go@${PROTOC_GEN_GO_VERSION} && \
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@${PROTOC_GEN_GO_GRPC_VERSION}
RUN --mount=type=cache,target=/root/.cache/buf \
    buf generate --template buf.gen.docker.yaml
ARG SERVICE
RUN test -n "${SERVICE}" && test -f "services/${SERVICE}/go.mod" || \
    { echo "SERVICE must name a Go service module under services/"; exit 1; }
RUN --mount=type=cache,target=/go/pkg/mod \
    cd services/${SERVICE} && go mod download
RUN if [ "${SERVICE}" = "api-gateway" ]; then \
      cd services/api-gateway && go run github.com/99designs/gqlgen generate; \
    fi
ARG VERSION=0.0.0
ARG COMMIT=unknown
RUN test -d "services/${SERVICE}/cmd/server" || \
    { echo "services/${SERVICE} does not define cmd/server and cannot produce a runtime image"; exit 1; }
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
      -trimpath \
      -ldflags="-s -w -X main.version=${VERSION} -X main.commit=${COMMIT}" \
      -o /out/server ./services/${SERVICE}/cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
ARG SERVICE
LABEL org.opencontainers.image.source="https://github.com/next-ecosystem/next"
LABEL org.opencontainers.image.title="next-${SERVICE}"
USER nonroot:nonroot
COPY --from=builder /out/server /usr/local/bin/server
EXPOSE 8080 7070 9090
ENTRYPOINT ["/usr/local/bin/server"]
