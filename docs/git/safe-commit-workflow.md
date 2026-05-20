# NEXT — Safe Commit Workflow

This document defines how every agent (Claude, Codex, Composer, Copilot) and
human contributor commits work into the NEXT monorepo without contaminating
domains, breaking the build, or leaking binaries.

> **Operating principle:** never run `git add .` in this repo.

---

## 1. Why `git add .` is forbidden

The NEXT working tree routinely holds:

- frontend WIP that belongs on `agent/composer-frontend`
- backend WIP that belongs on `agent/codex-backend`
- generated code under `gen/` and `services/*/gen/` that must not be committed
- local build artifacts (`*.exe`, `*.dll`, `dist/`, `.next/`, `bin/`)
- agent audit files that may or may not be in scope for the current branch
- experimental docs that belong on the architecture branch

A blanket `git add .` collapses all of these into one commit on whichever
branch is checked out. This violates the Parallel Agent Command System and
makes integration review at `develop` impossible.

---

## 2. The Safe Commit Workflow

### Step 1 — Confirm you are on the correct branch

```sh
git branch --show-current
```

| Agent    | Allowed branches                          |
| -------- | ----------------------------------------- |
| Claude   | `agent/claude-architecture`               |
| Codex    | `agent/codex-backend` (+ phase worktrees) |
| Composer | `agent/composer-frontend`                 |
| Copilot  | `agent/copilot-utilities`                 |

If you are on the wrong branch, **stop**. Move your work via
`git stash` or `git worktree add`, do not commit here.

### Step 2 — Review what you are about to commit

```sh
git status --short
git diff --stat
```

Look for files outside your agent domain. If you see any, they are not
yours to commit — coordinate the handoff.

### Step 3 — Stage explicitly

Always stage by path, never by wildcard sweep:

```sh
# Good
git add docs/git/safe-commit-workflow.md
git add packages/ui/src/web/feed-container.tsx

# Acceptable when scoped to a single owned directory
git add packages/ui/src/web/

# Forbidden
git add .
git add -A
git add --all
```

### Step 4 — Re-review staged set

```sh
git diff --cached --name-status
git diff --cached
```

If anything unexpected appears, `git restore --staged <path>` and rethink.

### Step 5 — Run local checks

For the affected domain(s):

```sh
# Frontend
pnpm install --frozen-lockfile   # only if package.json / lockfile changed
pnpm typecheck
pnpm lint
pnpm test

# Backend (Go)
task go:test
task go:lint

# Proto contracts (only if proto/* changed)
task buf:lint
task buf:breaking
```

### Step 6 — Commit with a Conventional Commits message

```sh
git commit -m "feat(<scope>): <imperative summary>"
```

`commit-msg` hook (commitlint) enforces format. `pre-commit` hook
(lint-staged + hygiene checks) enforces formatting + bans binaries.

### Step 7 — Verify the result

```sh
git log -1 --stat
git status --short      # should be clean (or only show files you knowingly left)
```

### Step 8 — Push only after the pre-push checklist

See [`pre-push-checklist.md`](./pre-push-checklist.md). Do not skip it.

---

## 3. Composing multiple commits

When a working tree contains several logical groups (e.g., a lockfile bump
plus a feature plus a docs note), split them:

```sh
git add packages/ui/src/web/feed-container.tsx
git commit -m "fix(ui): correct feed-container overflow handling"

git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore(deps): bump @next/ui peer to latest minor"

git add docs/git/safe-commit-workflow.md
git commit -m "docs(git): add safe commit workflow"
```

**Rule:** `pnpm-lock.yaml` is **never** committed alone. It must ship in
the same commit as the `package.json` change that caused it.

---

## 4. What to do if you accidentally staged the wrong thing

```sh
git restore --staged <path>            # unstage one file
git restore --staged .                 # unstage everything (file changes preserved)
git reset HEAD~1                       # undo the last commit (changes kept)
git reset --hard HEAD~1                # destroys uncommitted changes
```

For destructive operations: prefer `git stash` first so you can recover.

---

## 5. Hygiene safeguards installed in this repo

| Layer                | Where                                        | What it does                                                                                 |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `pre-commit` hook    | `.husky/pre-commit`                          | runs `lint-staged` + `scripts/hygiene/check-no-binaries.sh`                                  |
| Commit message check | `.husky/commit-msg`                          | enforces Conventional Commits via commitlint                                                 |
| Binary block         | `scripts/hygiene/check-no-binaries.sh`       | refuses `*.exe`, `*.dll`, `*.so`, `*.dylib`, `*.bin`, `*.zip`, `*.tar`, `*.gz`, `*.7z`, etc. |
| Service layout       | `scripts/hygiene/validate-service-layout.sh` | validates `/services/*` shape on demand / in CI                                              |
| `.gitignore`         | repo root                                    | catches build output, secrets, gen/                                                          |
| `.gitattributes`     | repo root                                    | enforces LF, marks lockfiles + generated code                                                |

Run hygiene checks manually any time:

```sh
sh scripts/hygiene/check-no-binaries.sh        # checks the current staged set
sh scripts/hygiene/validate-service-layout.sh  # checks /services/* layout
```

---

## 6. Anti-patterns

- `git add .`
- `git commit -am "wip"` (skips staging review, includes everything tracked)
- Committing on `main` or `develop` directly
- Committing on another agent's branch
- Committing build output, `*.exe`, archives, or `gen/` directories
- Committing `pnpm-lock.yaml` without the matching `package.json` change
- Skipping local typecheck / lint / test before push
- Force-pushing shared branches

---

_Maintained as part of the NEXT repo stabilization initiative._
