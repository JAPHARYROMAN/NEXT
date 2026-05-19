# Engineer onboarding

This is the path from a fresh machine to a first merged PR.

## Day 1 — environment

```bash
# 1. Install mise (single tool — manages everything else)
curl https://mise.run | sh

# 2. Clone
git clone https://github.com/next-ecosystem/next.git && cd next

# 3. Bootstrap
./scripts/bootstrap.sh
```

That installs Node 22, pnpm 9, Go 1.23, Rust 1.82, Python 3.12, uv, Terraform, kubectl, Helm, ArgoCD, buf, and protoc. It then installs all workspace deps and brings up the local data tier in Docker Compose.

When it finishes:

```bash
pnpm dev                                  # all dev servers (Turbo runs them concurrently)
open http://localhost:3000                # the web app
open http://localhost:3001                # Grafana (anonymous admin)
open http://localhost:16686               # Jaeger traces
```

## Day 2 — orient

Read in this order:

1. [Constitution](../AGENTS.md) — the philosophy.
2. [Architecture](ARCHITECTURE.md) — the system.
3. [adr/](adr/) — the why behind every load-bearing decision.
4. Your team's service README under [`services/<your-service>`](../services).

## Week 1 — first PR

- Pick a `good-first-issue` from your team's board.
- Read [CONTRIBUTING.md](../CONTRIBUTING.md). Conventional Commits. CODEOWNERS-gated review.
- Open the PR with a `feat(<scope>): …` title. CI runs lint + tests + security scans.
- Two approvals, one from CODEOWNERS, then squash-merge.

## Common workflows

```bash
# Add a shared dep across web + mobile
pnpm --filter @next/web --filter @next/mobile add some-lib

# Regenerate proto + GraphQL clients
task codegen

# Run a single service locally
pnpm --filter @next/web dev
go run ./services/auth-service/cmd/server

# Plan + apply infra (the apply happens in CI on merge)
task tf:plan ENV=staging

# Switch kubectl context to a cluster
task k8s:context ENV=staging

# Run tests by language
task test:ts
task test:go
task test:rust
task test:python
```

## Where to ask for help

| Topic | Where |
| --- | --- |
| Repo / tooling | `#platform-help` |
| Architecture | `#architecture` |
| Oncall escalation | PagerDuty (per-service rotation) |
| Security concerns | `security@next.example` |

Welcome to NEXT.
