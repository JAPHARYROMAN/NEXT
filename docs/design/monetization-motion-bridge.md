# Monetization Motion Bridge

Calm premium motion for commerce surfaces — aligned with [creator-monetization.md](../economy/creator-monetization.md).

## Principles

- **No urgency** — no countdown pulses, no casino shimmer
- **Reduced motion** — tier cards and charts respect `useReducedMotion`
- **Financial calm** — fade transitions only; no bounce on price changes

## Package mapping

| Surface           | Motion source                                       |
| ----------------- | --------------------------------------------------- |
| Tier cards        | `@next/subscription-ui` → `fadeVariants`            |
| Revenue charts    | `@next/revenue-ui` → `@next/charts`                 |
| Entitlement gates | `@next/entitlement-ui` → gradient overlay, no shake |

## Telemetry

`trackMotionSmoothness` optional on dashboard mount — not used for engagement optimization.
