# Phase 14 Post-Promotion Plan

## Release workflow cleanup

After the Phase 13 main promotion, the `Release` workflow still failed on `main`.
The failure was pre-existing and was not caused by the develop promotion.

Root cause: `changesets/action@v1` reached `pnpm run release`, then
`changeset publish` rejected the Changesets config because `.changeset/config.json`
listed `@next/immersive` in `ignore`. No workspace package has that name; the
immersive app package is `@next/immersive-app`.

Fix: keep the private app ignored from package release flow, but correct the
ignore entry to `@next/immersive-app`. This preserves release safety by keeping
application packages out of library publishing while allowing Changesets config
validation to complete.

Validation expected for the cleanup branch:

- YAML syntax check for `.github/workflows/release.yml`
- `actionlint` for GitHub Actions workflow syntax, when available
- `pnpm changeset status --verbose`
- `git diff --check`

The branch should merge through a pull request to `main`; do not force-push or
rewrite `main`.
