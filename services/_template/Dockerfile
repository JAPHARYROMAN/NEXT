# syntax=docker/dockerfile:1.10
# Canonical Dockerfile for NEXT Go services.
# Each service includes a one-line Dockerfile that ARGs SERVICE=<name> and inherits this.

ARG GO_VERSION=1.23.2
ARG ALPINE_VERSION=3.20
ARG SERVICE

FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS builder
ARG SERVICE
WORKDIR /src
COPY go.work go.work.sum ./
COPY packages/go ./packages/go
COPY services/${SERVICE}/go.mod services/${SERVICE}/go.sum ./services/${SERVICE}/
RUN --mount=type=cache,target=/go/pkg/mod \
    cd services/${SERVICE} && go mod download
COPY services/${SERVICE} ./services/${SERVICE}
ARG VERSION=0.0.0
ARG COMMIT=unknown
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
