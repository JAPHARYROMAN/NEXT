#!/usr/bin/env bash
# Boot a fresh NEXT checkout to a runnable state.
# Idempotent — safe to re-run.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

step() { printf "\n\033[1;34m==> %s\033[0m\n" "$*"; }

if ! command -v mise >/dev/null 2>&1; then
  step "Installing mise"
  curl https://mise.run | sh
fi

step "Installing toolchains via mise"
mise install

step "Installing JS/TS deps"
pnpm install --frozen-lockfile

step "Syncing Go workspace"
go work sync

step "Syncing Python workspace"
uv sync --all-packages

step "Fetching Rust deps"
cargo fetch

step "Running codegen (proto + GraphQL)"
buf generate
pnpm turbo run codegen

step "Booting local dependencies"
docker compose up -d

step "Waiting for Postgres + Kafka"
until docker compose exec -T postgres pg_isready -U next >/dev/null 2>&1; do sleep 1; done

echo "Done. Next steps:"
echo "  pnpm dev                       # start all dev servers"
echo "  task test                      # run all tests"
echo "  open http://localhost:3001     # Grafana (anonymous admin)"
echo "  open http://localhost:16686    # Jaeger traces"
