# Subscription UX

Membership flows on web (`/subscriptions`, `/[handle]/membership`) via `@next/subscription-ui`.

## Components

- Tier cards with benefit lists
- Accessible tier comparison table
- Billing status with entitlement badge mapping
- Renewal transparency panel
- Cancellation flow — one confirm, access until period end

## Anti-patterns avoided

- No retention maze
- No hidden pricing
- Cancel as prominent as subscribe

## State

`useSubscriptionFlowStore` tracks browse → compare → confirm → billing → complete.

## Telemetry

`trackSubscriptionFlow`, `trackTierComparison` for friction analysis.
