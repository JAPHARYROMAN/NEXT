# Entitlement States

Contract-ready states in `@next/entitlement-ui`.

| State             | Label              | UX tone                          |
| ----------------- | ------------------ | -------------------------------- |
| `entitled`        | Full access        | Show content                     |
| `not_entitled`    | Preview only       | Soft gate                        |
| `expired`         | Access expired     | Renew option                     |
| `grace`           | Grace period       | Access continues, renew reminder |
| `pending_payment` | Payment pending    | Wait state                       |
| `refund_pending`  | Refund in progress | Neutral                          |
| `revoked`         | Access revoked     | Explain reason slot              |
| `creator_comp`    | Creator access     | Comp badge                       |

## Components

- `EntitlementBadge` — status chip
- `EntitlementGate` — preview + action
- `EntitlementStatePanel` — account access list

## Store

`useEntitlementStore` for demo/preview state in web surfaces.
