# 0014. Frontend: Next.js App Router + React Server Components + Edge Runtime

- **Status**: Accepted
- **Date**: 2026-05-19
- **Deciders**: @next-ecosystem/web @next-ecosystem/design-systems
- **Tags**: frontend, web

## Context

The web surface is the primary discovery and viewing experience for NEXT. It must feel cinematic and instant on first paint, work on slow networks globally, support real-time interactions (live, chat, presence), and share a design system with mobile, TV, studio, and immersive surfaces.

## Decision

- **Next.js 15+** with the **App Router** is the web framework.
- **React Server Components** by default; client components opt-in.
- **Edge Runtime** for routes that benefit from low latency and minimal cold-start (auth-aware caching, personalized landings, A/B routing). Node runtime for routes that need stateful or larger deps.
- **TanStack Query** for client-side server data; **Zustand** for client UI state.
- **Tailwind CSS** + a custom design-system layer in [`packages/design-system`](../../packages/design-system).
- **Framer Motion** for motion; **Three.js / React Three Fiber** for 3D / immersive embeds.

## Alternatives considered

- **Remix** — strong; chose Next.js for RSC maturity, broader ecosystem, and Vercel-grade Edge defaults that map well to CloudFront Functions in our infra.
- **Astro** — wonderful for content; not the right primary for an interactive, real-time, video-heavy product.
- **Pure CSR SPA** — rejected: first paint, SEO, and global latency stories all suffer.

## Consequences

### Positive
- RSC shifts data fetching to the server; client bundles stay smaller.
- Edge runtime gives us sub-50 ms TTFB globally for personalized routes.
- Shared Tailwind tokens + design-system primitives keep UX coherent across surfaces.
- Apollo + persisted queries map cleanly to App Router data fetching.

### Negative
- The boundary between server and client components requires discipline; we lint for client-only APIs in RSC files.
- The Edge runtime's limited Node API surface forces some libraries to live only in the Node runtime; per-route runtime declarations are explicit.

## Implementation notes

- Rendering strategy declared per route via `export const runtime = 'edge' | 'nodejs'`.
- Data fetching: prefer server actions + server fetches; client TanStack Query for hot interactive surfaces.
- Image optimization via `next/image` + CloudFront-cached output.
- Performance budget enforced in CI via [size-limit](https://github.com/ai/size-limit) on the client bundle.
