# Mobile Navigation System

## Components (`@next/navigation-ui`)

- **AdaptiveBottomNav** — Safe-area bottom bar; hides in fullscreen; 44px touch targets; nav timing telemetry.
- **ContextualNavBar** — Immersive/context titles with back-to-nav affordance.
- **FloatingNavSurface** — Panel motion for contextual toolbars.

## Integration

`@next/ui` `MobileNav` delegates to `AdaptiveBottomNav` for backward compatibility with `AppShell`.

Mobile routes use `mobileNavItems` (`/mobile`, `/mobile/feed`, explore, library, search).

## States

`useMobileNavigationStore`: `standard` | `fullscreen` | `hidden` — driven by immersive player and watch routes.
