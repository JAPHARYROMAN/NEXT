# NEXT — Pre-Push Checklist

Use this list every time before `git push`. It takes a few minutes and prevents
hours of downstream pain.

> If any item fails, **do not push**. Fix it, or coordinate with the
> domain-owning agent.

---

## 0. Identity

```sh
git branch --show-current
git remote -v
```

- [ ] Current branch matches my agent's allowed branch (see
      [`safe-commit-workflow.md`](./safe-commit-workflow.md) §2).
- [ ] `origin` points to `github.com/JAPHARYROMAN/NEXT.git`.

---

## 1. Working tree state

```sh
git status --short
git status --branch
```

- [ ] Only files I intend to push appear in the status output.
- [ ] No surprise modifications outside my domain.
- [ ] No `??` (untracked) files I forgot to add or `.gitignore`.

---

## 2. Staged set review

```sh
git diff --cached --name-status
git diff --cached --stat
```

- [ ] Every staged path belongs to my agent domain.
- [ ] No `*.exe`, `*.dll`, `*.so`, `*.dylib`, `*.bin`, `*.zip`, `*.tar`, `*.gz`, `*.7z`, `*.mp4`, `*.mov`, etc.
- [ ] No `gen/` files staged (except `gen/go/go.mod`, `gen/go/go.sum`).
- [ ] No `node_modules/`, `.next/`, `.turbo/`, `dist/`, `bin/` staged.
- [ ] No `*.env*`, `*.pem`, `*.key`, `*.crt`, `secrets/`.

```sh
sh scripts/hygiene/check-no-binaries.sh
```

- [ ] Binary check passes.

---

## 3. Lockfile coherence

- [ ] If `pnpm-lock.yaml` is in the staged set, the matching `package.json`
      changes that produced it are in the **same** commit.
- [ ] If `go.work` or any `go.mod` changed, `go.sum` is also staged.

---

## 4. Generated-code freshness

Only if you changed `.proto`, OpenAPI/GraphQL schemas, or anything else that
produces generated output:

```sh
task buf:generate                # or: pnpm codegen
git status --short               # confirm gen/ stays ignored and unchanged in index
```

- [ ] Generated code regenerates cleanly.
- [ ] No `gen/` paths appear staged.

---

## 5. Local checks for the affected domain(s)

### Frontend (`apps/*`, `packages/*` excluding Go)

```sh
pnpm install --frozen-lockfile     # only if lockfile changed
pnpm typecheck
pnpm lint
pnpm test
```

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Tests pass (unit + integration as applicable).

### Backend (Go) (`services/*`)

```sh
task go:test
task go:lint
sh scripts/hygiene/validate-service-layout.sh
```

- [ ] Go tests pass.
- [ ] Go lint passes.
- [ ] Service layout validation passes.

### Proto / contracts

```sh
task buf:lint
task buf:breaking                 # only if you changed *.proto
```

- [ ] `buf lint` passes.
- [ ] `buf breaking` reports no unintended breaking changes (or the change
      is intentional and version-bumped).

### Infrastructure

```sh
terraform fmt -recursive -check infrastructure/
```

- [ ] Terraform is formatted (only if infra changed).

---

## 6. Commit hygiene

```sh
git log origin/$(git branch --show-current)..HEAD --oneline
```

- [ ] Every commit message follows Conventional Commits
      (`feat(scope):`, `fix(scope):`, `docs:`, `chore:`, `refactor:`, etc.).
- [ ] No `wip`, `fix typo`, `temp`, `debug`, `asdf` style messages.
- [ ] Commit boundaries are logical (no megacommits crossing 3+ scopes).

If commits are messy:

```sh
git rebase -i origin/$(git branch --show-current)
```

(Only on your own agent branch — never on shared branches.)

---

## 7. Upstream sync

```sh
git fetch origin --prune
git log HEAD..origin/$(git branch --show-current) --oneline
```

- [ ] My branch is **not behind** its remote (or I have intentionally rebased
      on top of the latest upstream).

If behind:

```sh
git pull --rebase origin $(git branch --show-current)
```

Re-run §5 after rebase.

---

## 8. Cross-agent integration sanity

- [ ] I am **not** about to publish files owned by another agent (frontend
      files on Claude branch, backend files on Composer branch, etc.).
- [ ] I have **not** modified shared contracts (proto, event schemas,
      shared package public APIs) without coordinating with the contract owner.
- [ ] If I changed an API contract, the consumers (frontend clients, tests,
      docs) are updated in the same push.

---

## 9. Push

```sh
git push origin $(git branch --show-current)
```

- [ ] Push succeeded.
- [ ] CI status checked within a few minutes: any red checks are addressed.

---

## 10. After push

- [ ] If this push is part of a phase merge, open a PR into `develop`.
- [ ] Mention the integration reviewer (Claude) for cross-cutting changes.
- [ ] Update the relevant phase tracker (`IMPLEMENTATION_STATUS.md` or
      the active audit doc).

---

## Quick command bundle

```sh
git fetch origin --prune
git status --short
git diff --cached --name-status
sh scripts/hygiene/check-no-binaries.sh
sh scripts/hygiene/validate-service-layout.sh
pnpm typecheck && pnpm lint && pnpm test
task go:test && task go:lint
git log origin/$(git branch --show-current)..HEAD --oneline
```

If every line above is clean -> push. Otherwise -> stop and fix.

---

_Maintained as part of the NEXT repo stabilization initiative._
