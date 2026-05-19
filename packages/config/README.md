# @next/config

Shared toolchain configuration for the NEXT monorepo. Other workspaces consume these flat configs and `tsconfig` bases via the `@next/config` exports.

## Exports

| Export | Purpose |
| --- | --- |
| `@next/config/eslint/base` | Base ESLint flat config |
| `@next/config/eslint/react` | Extends base with React + a11y rules |
| `@next/config/eslint/next` | Extends `react` with Next.js rules |
| `@next/config/eslint/node` | Extends base for Node services |
| `@next/config/tsconfig/base` | Strict TS base (no JSX) |
| `@next/config/tsconfig/library` | For publishable libraries (emits .d.ts) |
| `@next/config/tsconfig/next` | For Next.js apps |
| `@next/config/tsconfig/react-native` | For Expo / React Native apps |
| `@next/config/tailwind/base` | Tailwind preset with NEXT design tokens |
| `@next/config/vitest/base` | Base Vitest config |
| `@next/config/vitest/react` | Vitest + jsdom + Testing Library |

## Versioning

This package is versioned via Changesets and consumed by workspace protocol. Bumping it triggers downstream rebuilds via Turbo's dependency graph.
