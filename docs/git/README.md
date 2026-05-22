# NEXT — Git & Repo Hygiene Docs

Lightweight stabilization safeguards for the NEXT monorepo.

| Doc                                                      | Purpose                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| [`safe-commit-workflow.md`](./safe-commit-workflow.md)   | How to stage and commit without contaminating agent domains. |
| [`pre-push-checklist.md`](./pre-push-checklist.md)       | Checks to run before every push.                             |
| [`generated-code-policy.md`](./generated-code-policy.md) | What is tracked vs. generated (especially `gen/`).           |

Companion scripts:

| Script                                       | Purpose                              | Hooked into            |
| -------------------------------------------- | ------------------------------------ | ---------------------- |
| `scripts/hygiene/check-no-binaries.sh`       | Refuses staged binary/archive files. | `.husky/pre-commit`    |
| `scripts/hygiene/validate-service-layout.sh` | Validates `/services/*` layout.      | manual + CI (optional) |
| `scripts/hygiene/service-exceptions.txt`     | Approved layout deviations.          | read by the validator  |

These additions modify no product code. They only constrain how and what is
committed.

---

## Running the hygiene scripts

All scripts are POSIX `sh`-compatible and live under `scripts/hygiene/`. They
exit non-zero on failure so they compose cleanly with hooks and CI.

### `check-no-binaries.sh`

Refuses to let binaries, archives, build artifacts, or media files enter the
git index. Already wired into `.husky/pre-commit`, so it runs automatically on
every `git commit`. Run it manually anytime:

```sh
# Linux / macOS / Git Bash on Windows
sh scripts/hygiene/check-no-binaries.sh

# It inspects only files currently staged (`git diff --cached --name-only`).
# Exit code 0 = clean. Exit code 1 = blocked file detected.
```

To bypass in an emergency (strongly discouraged — prefer adding the path to
`.gitignore` or `.gitattributes` instead):

```sh
git commit --no-verify -m "..."
```

### `validate-service-layout.sh`

Verifies every `services/*` directory follows the canonical Go layout
(`cmd/server`, `internal/{api,domain,store}`, paired `migrations/NNN_*.up.sql`

- `*.down.sql`). Approved deviations are listed one per line in
  `scripts/hygiene/service-exceptions.txt`. Run manually before pushing service
  changes:

```sh
sh scripts/hygiene/validate-service-layout.sh

# Exit 0 = all services compliant.
# Exit 1 = one or more services violate the layout and are not in the
#          exceptions file. Output names the offending paths.
```

### Optional CI wiring

Both scripts are safe to invoke from a CI `hygiene` job:

```yaml
- name: Repo hygiene
  run: |
    sh scripts/hygiene/check-no-binaries.sh
    sh scripts/hygiene/validate-service-layout.sh
```

Until that job exists, contributors should run the validator manually as part
of [`pre-push-checklist.md`](./pre-push-checklist.md) §3.
