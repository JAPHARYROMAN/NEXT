# syntax=docker/dockerfile:1.10
# Canonical Dockerfile for NEXT Go services.
# Each service includes a one-line Dockerfile that ARGs SERVICE=<name> and inherits this.

ARG GO_VERSION=1.25.0
ARG ALPINE_VERSION=3.22
ARG BUF_VERSION=1.45.0
ARG SERVICE

FROM bufbuild/buf:${BUF_VERSION} AS buf

FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS builder
ARG SERVICE
WORKDIR /src
# Build the target module, not the repo workspace. The root go.work includes
# scaffold modules that are intentionally absent from each slim image context.
ENV GOWORK=off
COPY --from=buf /usr/local/bin/buf /usr/local/bin/buf
COPY buf.yaml buf.gen.yaml buf.lock ./
COPY gen/go ./gen/go
COPY packages/go ./packages/go
COPY packages/events/schemas ./packages/events/schemas
COPY services ./services
RUN buf generate
RUN --mount=type=cache,target=/go/pkg/mod \
    cd services/${SERVICE} && go mod download all
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    if [ "${SERVICE}" = "api-gateway" ]; then \
      cd services/api-gateway && go run github.com/99designs/gqlgen generate; \
    fi
ARG VERSION=0.0.0
ARG COMMIT=unknown
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    cd services/${SERVICE} && CGO_ENABLED=0 GOOS=linux go build \
      -trimpath \
      -ldflags="-s -w -X main.version=${VERSION} -X main.commit=${COMMIT}" \
      -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
ARG SERVICE
LABEL org.opencontainers.image.source="https://github.com/next-ecosystem/next"
LABEL org.opencontainers.image.title="next-${SERVICE}"
USER nonroot:nonroot
COPY --from=builder /out/server /usr/local/bin/server
EXPOSE 8080 7070 9090
ENTRYPOINT ["/usr/local/bin/server"]
