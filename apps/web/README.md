# @next/web

The primary NEXT web experience. Hosts every product surface (Video, Live, Explore, Communities, Learn, Sports, Commerce, AI assistant, World embeds).

## Architecture

- **Framework**: Next.js 15 App Router with React 19.
- **Rendering**: React Server Components by default; Edge runtime for personalized routes (`/`, `/feed`, `/watch/[id]`); Node runtime where larger deps require it (transcoding callbacks, server actions touching ffmpeg-wasm).
- **Routing**: file-system based App Router. Route groups segment by product (`(video)`, `(live)`, `(community)`, …).
- **Data**: server-side fetches via `@next/api-client` GraphQL; client-side interactive surfaces use TanStack Query against the same gateway.
- **State**: server data is cached in TanStack Query; ephemeral client UI state in Zustand stores scoped per surface; no global Redux.
- **API**: federated GraphQL via the api-gateway (`https://api.next.io/graphql`). Subscriptions over WebSocket for live + chat.
- **Auth**: OIDC code + PKCE via `@next/auth-sdk/client`. Access tokens kept in memory; refresh in HttpOnly cookie.

## Performance strategy

- App Router PPR ("incremental") splits the page into a static shell + dynamic islands.
- Edge runtime for the routes where TTFB dominates UX.
- `next/image` + CloudFront for image delivery.
- Persisted GraphQL queries enforced from production builds.
- `size-limit` checks in CI keep route bundles under budget.

## Testing

- Unit + component: Vitest + Testing Library.
- E2E: Playwright (`pnpm test:e2e`).
- Visual regressions: Chromatic against the design system stories.

## Run

```bash
pnpm --filter @next/web dev
```

Open <http://localhost:3000>.

## Deploy

Containerised via `Dockerfile`; deployed by ArgoCD into the `next-web` namespace. See [`infrastructure/kubernetes/apps/web`](../../infrastructure/kubernetes).
