# Changesets

This directory tracks **library** changesets for shared `/packages/*`. Apps and services release via CI on tag — they are excluded from changesets in `config.json`.

To add a changeset:

```bash
pnpm changeset
```

Pick the affected packages, the bump type (`patch` / `minor` / `major`), and write a one-line summary. The bot will collect changesets into a release PR; merging that PR publishes new versions and writes `CHANGELOG.md` entries.
