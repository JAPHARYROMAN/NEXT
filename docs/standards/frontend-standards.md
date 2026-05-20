# Frontend Standards

> The enforceable standard for every app under `/apps` and every frontend
> package. Its job: one coherent product experience across many surfaces, built
> by many contributors, with no visual drift and no backend logic leaking in.

Status: **binding**. Grounded in [ADR 0014](../adr/0014-frontend.md) (Next.js +
React) and [ADR 0015](../adr/0015-mobile.md) (Expo/React Native).

## 1. Runtime

- `/apps/*` are TypeScript + React (Next.js for web surfaces, Expo/React Native
  for mobile). No other frontend runtime without an ADR
  ([runtime governance](../governance/runtime-governance.md)).
- An app **MUST NOT** contain backend/service logic, direct database access, or
  direct gRPC-to-internal-service calls. Apps reach the backend **only** through
  the GraphQL gateway and `@next/*` SDK packages.

## 2. The frontend package taxonomy

The frontend package family is large; the Phase 10 audit flagged proliferation
risk (PB-2). The taxonomy is therefore **standardized** — each package has one
job and no package overlaps another:

| Layer         | Package(s)                                              | Owns                                                                |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Tokens        | `design-system`                                         | design tokens, themes, motion easings, breakpoints, a11y primitives |
| Theme runtime | `theme-system`                                          | adaptive theme engine, persistence, CSS variables                   |
| Motion        | `animation-system`                                      | shared Framer Motion variants, reduced-motion                       |
| Layout        | `layout-engine`                                         | adaptive layout primitives                                          |
| Icons         | `icons`                                                 | accessible SVG icon primitives                                      |
| Primitives    | `ui`                                                    | cross-surface UI primitives (web + native)                          |
| Domain UI     | `media-ui`, `creator-ui`, `studio-components`, `charts` | domain-specific composed components                                 |
| Player        | `player-controls`, `video-player`                       | headless player state machine + React player                        |

A new visual capability extends an **existing** package per this taxonomy; a new
frontend package requires architecture review — it must prove no existing
package is its home.

## 3. Component architecture

- Components are **composed, not duplicated** — a needed primitive comes from
  `ui`/`design-system`; if it does not exist, it is added there, once, not
  re-implemented per app.
- A component does one thing; presentational and container concerns are
  separated.
- Cross-surface components live in `ui`; app-specific composition lives in the
  app. An app does not redefine a shared primitive.
- Server vs. client components follow Next.js App Router conventions
  ([ADR 0014](../adr/0014-frontend.md)) — server by default, `'use client'`
  only where interactivity requires it.

## 4. State management doctrine

- **Server state** — TanStack Query against the GraphQL gateway. Server data is
  not hand-cached in a store.
- **Client/UI state** — Zustand stores, scoped per workspace/surface.
- **URL state** — routing and shareable state live in the URL, not a store.
- Do not mix the three — server data in Query, UI state in Zustand, navigational
  state in the URL.

## 5. Motion standards

- All motion uses `animation-system` variants — no ad-hoc per-component
  animation values. This is what prevents "animation chaos".
- Motion **MUST** honor `prefers-reduced-motion` — every animation has a
  reduced-motion form.
- Motion is purposeful (feedback, continuity, hierarchy) — never decorative
  noise, never engagement-bait.

## 6. Accessibility minimums

Non-negotiable, enforced in review and (where mechanizable) in CI:

- semantic HTML; correct roles; keyboard operability for every interaction;
- visible focus states; logical focus order;
- WCAG AA contrast via `design-system` tokens;
- all media controls and the player are fully keyboard- and screen-reader-
  accessible;
- a11y is tested ([testing-standards.md](testing-standards.md)).

## 7. Responsive standards

- Layouts are responsive from small mobile to large/ultrawide via
  `layout-engine` primitives — not per-app breakpoint guesses.
- Mobile-first and **data-aware** — consistent with NEXT's mobile-first global
  markets ([docs/roadmap/global-expansion.md](../roadmap/global-expansion.md)):
  assume variable connectivity; lazy-load; respect data cost.

## 8. Frontend observability

- Apps emit telemetry via `@next/telemetry` — Core Web Vitals, route-level
  performance, error instrumentation, and QoE for media surfaces (the player
  emits QoE to analytics).
- Errors are captured with correlation context, not swallowed.
- Performance budgets per surface ([testing-standards.md](testing-standards.md));
  a regression is a review concern.

## 9. Prohibited patterns

- ✗ Backend/service logic, DB access, or internal-service calls in an app.
- ✗ Duplicating a component that exists in `ui`/`design-system`.
- ✗ Hard-coded colors, spacing, motion values — use `design-system` tokens.
- ✗ A new frontend package without architecture review.
- ✗ "SaaS-template drift" — generic dashboard styling that ignores the NEXT
  design language.
- ✗ Inaccessible interactions (no keyboard path, no focus state).
- ✗ Animation outside `animation-system`; animation without a reduced-motion
  form.

## Related

- [ADR 0014](../adr/0014-frontend.md) · [naming-conventions.md](naming-conventions.md) · [testing-standards.md](testing-standards.md) · [monorepo-governance.md](monorepo-governance.md)
