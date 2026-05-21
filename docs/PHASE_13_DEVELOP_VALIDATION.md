# NEXT — Phase 13 Develop Validation Follow-Up

**Branch:** `agent/codex-stabilization`
**Base:** `develop` at `b70f50a`
**Scope:** Phase 13 blocker fix for `services/api-gateway` Go verification.

## Verdict

`services/api-gateway` is now generated, compiled, and tested by the Go workspace verification path.

The previous Phase 13 blocker had two parts:

1. `scripts/go-work-run.mjs` silently skipped modules that failed `go list` because generated packages were missing.
2. `services/api-gateway/internal/gql/resolver/schema.resolvers.go` could be corrupted by gqlgen because resolver helper code lived inside the regenerated resolver file and a custom multi-line Go comment was preserved incorrectly.

Both are resolved on this branch.

## Fix Summary

- Added `codegen:gqlgen` to `Taskfile.yml`.
- Wired `test:go` to run both proto and gqlgen codegen before Go workspace tests.
- Hardened `scripts/go-work-run.mjs` so unresolved generated packages fail instead of being skipped.
- Moved API gateway resolver helper functions into `services/api-gateway/internal/gql/resolver/helpers.go`.
- Left `services/api-gateway/internal/gql/generated/` untracked, because it is generated output ignored by repository policy.
- Reduced the `Me` resolver comment to the gqlgen-safe generated comment so regeneration stays stable.

## Verification Results

| Command                                   | Result |
| ----------------------------------------- | ------ |
| `task codegen`                            | PASS   |
| `go test ./...` in `services/api-gateway` | PASS   |
| `node scripts/go-work-run.mjs test ./...` | PASS   |
| `buf lint`                                | PASS   |

## API Gateway Coverage

`node scripts/go-work-run.mjs test ./...` now includes:

```txt
==> ./services/api-gateway: go test -coverprofile=coverage.out ./...
github.com/next-ecosystem/next/services/api-gateway/cmd/server
github.com/next-ecosystem/next/services/api-gateway/internal/authz
github.com/next-ecosystem/next/services/api-gateway/internal/gql/generated
github.com/next-ecosystem/next/services/api-gateway/internal/gql/model
github.com/next-ecosystem/next/services/api-gateway/internal/gql/resolver
```

The old `skipped: unresolved generated package` path has been removed.

## Generated Output Policy

Generated GraphQL server code is not committed:

- `services/api-gateway/internal/gql/generated/generated.go` is produced by `task codegen`.
- `.gitignore` ignores it through `**/generated/`.
- The tracked source of truth remains `services/api-gateway/schema/schema.graphqls`, `services/api-gateway/gqlgen.yml`, and the handwritten resolver files.

## Main Eligibility

This blocker no longer prevents main promotion. Main eligibility still depends on the remaining Phase 13 gates, especially independent Rust CI confirmation on Ubuntu.
