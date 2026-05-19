# Contributing to NEXT

NEXT is a polyglot, planetary-scale monorepo. The contribution flow keeps the codebase coherent across thousands of engineers and decades of evolution. Read this end-to-end before your first PR.

---

## Table of contents

- [Workflow](#workflow)
- [Branching](#branching)
- [Commit conventions](#commit-conventions)
- [Pull requests](#pull-requests)
- [Code review](#code-review)
- [Testing requirements](#testing-requirements)
- [Documentation](#documentation)
- [Architecture changes](#architecture-changes)
- [Releasing](#releasing)
- [Style](#style)

---

## Workflow

```
1. Pull main             ──►  git pull --rebase origin main
2. Branch                ──►  git switch -c <type>/<scope>/<short-slug>
3. Code + test locally   ──►  task test:<lang>
4. Commit (conventional) ──►  git commit -m "feat(feed): add muted-creator filter"
5. Push, open PR         ──►  gh pr create
6. CI green + 2 reviews  ──►  squash merge
7. ArgoCD deploys        ──►  staging auto, prod gated
```

---

## Branching

Branch names follow `<type>/<scope>/<slug>`:

```
feat/feed/muted-creators
fix/auth/refresh-token-race
infra/k8s/karpenter-gpu-pool
docs/adr/0007-rpc-framework
```

Use `release/x.y.z` only for cut release branches; everything else is short-lived (< 5 days).

---

## Commit conventions

[Conventional Commits](https://www.conventionalcommits.org) enforced via commitlint.

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types** — `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`, `security`, `infra`, `breaking`.

**Scopes** — see [commitlint.config.cjs](commitlint.config.cjs) for the full allowlist. The scope corresponds to a top-level domain such as `web`, `auth`, `recommendation`, `ml-vector`, `k8s`, `terraform`.

Examples:

```
feat(recommendation): add two-tower candidate generator
fix(auth): rotate JWT signing key on revocation
perf(media): switch transcoder to AV1 SVT-AV1 backend
infra(k8s): add dedicated GPU node pool for inference
security(api-gateway): require mTLS for internal callers
breaking(events): v2 of feed.viewed with watch_duration_ms
```

Breaking changes require either a `breaking:` type or a `BREAKING CHANGE:` footer.

---

## Pull requests

PR title mirrors the commit subject. The PR body must include:

1. **What** — one paragraph describing the change.
2. **Why** — the motivation; link the issue, ADR, or incident.
3. **How** — short technical summary for reviewers.
4. **Risk** — what could break; what's behind a feature flag.
5. **Verification** — what you ran; screenshots / metrics if relevant.

Size: target < 400 lines of diff. Larger PRs should be split unless a single atomic refactor.

CI must be green. Required checks:

- `ci / lint`
- `ci / typecheck`
- `ci / test`
- `ci / build`
- `security / codeql`
- `security / dependency-review`
- `security / image-scan` (for service PRs)

---

## Code review

Two approvals required. One must be from a `CODEOWNERS` reviewer for every changed path.

Review etiquette:

- Comment on *behavior* and *contracts*, not on style — formatters and linters handle style.
- Block on correctness, security, contract changes, perf regressions, missing tests, missing observability.
- Suggest, don't dictate, on aesthetics. Architecture disagreements escalate to an ADR.
- Reply to every comment before merge.

---

## Testing requirements

Every PR adds tests proportional to risk:

| Change | Tests required |
| --- | --- |
| Bug fix | Regression test that fails before, passes after |
| New endpoint / event | Unit + integration; event consumer contract test |
| New UI surface | Component test + Playwright happy path |
| New infra resource | `terraform plan` snapshot; policy test |
| Cross-service contract change | Updated proto + consumer-driven contract test |

Coverage gate: services must hold ≥ 75% line coverage on touched packages; AI systems ≥ 60%.

Load tests for any change to a hot path live under [tests/load/](tests/load) and run nightly via k6.

---

## Documentation

Update docs in the same PR as the code:

- **Public-facing behavior** → service README + GraphQL schema docs.
- **Cross-service contracts** → proto field comments + `docs/api-architecture.md`.
- **New event** → event schema with semver in [packages/events/schemas](packages/events/schemas) + `docs/event-architecture.md`.
- **Runbook-worthy operations** → `docs/runbooks/<service>.md`.
- **Significant decisions** → new ADR (see below).

---

## Architecture changes

Any of these requires an ADR before the PR is merged:

- New service or removal of a service
- New top-level technology (DB, queue, language)
- Cross-cutting protocol or contract change
- Tenancy, isolation, or trust-boundary change
- Anything you'd want to explain to your replacement in two years

Procedure:

1. Copy `docs/adr/template.md` to `docs/adr/NNNN-short-title.md` (next number).
2. Status: `Proposed`. Open a docs-only PR.
3. Discuss; squash to `Accepted` when consensus reached.
4. Implementation PRs reference the ADR.

---

## Releasing

- **Libraries (`/packages/*`)** → versioned via [Changesets](.changeset/). Run `pnpm changeset` in your PR.
- **Apps & services** → continuously deployed from `main`. ArgoCD watches the manifests in [infrastructure/kubernetes](infrastructure/kubernetes).
- **Infra (Terraform)** → planned in PR, applied on merge via GitHub Actions with manual approval gate for `prod`.

See [docs/production-deployment.md](docs/production-deployment.md) for rollback, canary, and feature-flag procedures.

---

## Style

- Formatters and linters are the source of truth. Don't argue with them; fix the rule via an ADR if you must.
- No tutorial code. No half-finished implementations. No `TODO` without a linked issue.
- Comments explain *why*, never *what*.
- File length is not a virtue. A 1,200-line file that's all one thing is fine; a 200-line file glued from three unrelated things is not.
- Prefer clear over clever.
