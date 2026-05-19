# Tests (cross-cutting)

Per-service unit + integration tests live with their service. This directory holds **cross-cutting** suites that exercise the platform end-to-end.

```
tests/
├── e2e/      # Playwright across the federated GraphQL + web stack
└── load/     # k6 load + spike scenarios
```

## E2E

```bash
pnpm test:e2e           # local — boots @next/web on :3000
BASE_URL=https://staging.next.io pnpm test:e2e
```

## Load

```bash
k6 run tests/load/feed.k6.ts --env BASE=https://api.staging.next.io --env TOKEN=...
```

The CI workflow [`load.yml`](../.github/workflows/load.yml) (nightly) runs the load suite against staging and posts results to the `#load-results` Slack channel.
