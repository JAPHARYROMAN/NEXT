# syntax=docker/dockerfile:1.10
# Multi-stage build for NEXT Go services. Reproducible, distroless final image.

ARG GO_VERSION=1.23.2
ARG ALPINE_VERSION=3.20

# ---- builder ---------------------------------------------------------------
FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS builder
WORKDIR /src

# Cache deps independently of source.
COPY go.work go.work.sum ./
COPY packages/go ./packages/go
COPY services/auth-service/go.mod services/auth-service/go.sum ./services/auth-service/
RUN --mount=type=cache,target=/go/pkg/mod \
    cd services/auth-service && go mod download

# Source.
COPY services/auth-service ./services/auth-service

ARG VERSION=0.0.0
ARG COMMIT=unknown
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux \
    go build \
      -trimpath \
      -ldflags="-s -w -X 'main.version=${VERSION}' -X 'main.commit=${COMMIT}'" \
      -o /out/auth-service \
      ./services/auth-service/cmd/server

# ---- runtime ---------------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot AS runtime

LABEL org.opencontainers.image.source="https://github.com/next-ecosystem/next"
LABEL org.opencontainers.image.title="next-auth-service"

USER nonroot:nonroot
COPY --from=builder /out/auth-service /usr/local/bin/auth-service

EXPOSE 8080 7070 9090
ENTRYPOINT ["/usr/local/bin/auth-service"]
