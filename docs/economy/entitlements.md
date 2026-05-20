# Entitlement Architecture

> An entitlement is the **right to access** something paid-for — a premium
> video, a community, a live event, a download. Entitlements are what money
> buys; this is how they are granted, checked fast, revoked cleanly, and never
> allowed to break core playback.

## 0. Principle

An entitlement check sits on a hot path — it runs every time a viewer opens
gated content. So it must be **fast, cached, and degradation-safe**. And because
it gates _access_, it must be **revocable and auditable** — a refund or a
cancellation must reliably and traceably remove access.

The governing constraint: **a failure in the entitlement system must never break
core (free) playback.** Commerce is allowed to degrade; the platform's free
experience is not.

## 1. What an entitlement is

```
Entitlement {
  id
  subject_id            // the user who holds it
  resource_ref          // what it grants access to (video, community, event, product)
  kind                  // premium_content | community | live_event | download | early_access | exclusive_chat
  source                // subscription:<id> | purchase:<id> | grant:<id>
  state                 // active | revoked | expired
  granted_at, expires_at // expires_at null = no expiry (e.g. a one-time purchase)
}
```

An entitlement is **derived** — it is granted _because_ of a subscription, a
purchase, or an explicit grant. The source system (subscription / purchase) is
authoritative; the entitlement is the projection used for fast checks.

## 2. Grant & revoke

Entitlements move via events ([economy-events.md](economy-events.md)):

| Trigger                                | Effect                            |
| -------------------------------------- | --------------------------------- |
| subscription → `active`                | grant the tier's entitlements     |
| one-time purchase succeeds             | grant the purchased entitlement   |
| subscription → `canceled` (period end) | revoke the tier's entitlements    |
| refund / chargeback                    | revoke the associated entitlement |
| trust & safety action                  | revoke (e.g. content removed)     |
| explicit creator/admin grant or revoke | grant / revoke                    |

Grant and revoke are **idempotent** — replaying the event is a no-op if the
entitlement is already in the target state. The entitlement store
(`commerce-service` Postgres, [ADR 0017](../adr/0017-database-per-service.md)) is
the durable record; revocation flips `state` and is never a hard delete — the
history is auditable.

## 3. The check path & caching

```
 viewer opens gated content
        │
        ▼
 entitlement check ──▶ Redis cache (hit) ──▶ allow / deny   ← typical, sub-ms
        │ (miss)
        ▼
 Postgres entitlement store ──▶ populate cache ──▶ allow / deny
```

- **Redis cache** holds active entitlements per user for low-latency checks.
- A check is a fast lookup: _does this user hold an active, unexpired
  entitlement for this resource?_
- Cache entries carry a **short TTL** and are **invalidated on revoke** — a
  revocation event purges the relevant cache keys immediately, so a cancelled or
  refunded user loses access promptly, not at TTL expiry.

## 4. Revocation is safety-critical

Revocation must be **reliable** — a refunded user keeping access is financial
leakage; a chargeback-abuser keeping access is fraud. So:

- revoke is event-driven _and_ idempotent (§2);
- revoke **purges the cache** synchronously with the store update — no waiting
  for TTL;
- a periodic **reconciliation job** ([resilience.md](resilience.md)) re-derives
  entitlements from the authoritative subscription/purchase state and corrects
  any cache or store drift — a backstop against a missed event.

## 5. Degradation — the hard rule

The entitlement system can fail (Redis down, `commerce-service` degraded). The
behavior under failure is **explicitly designed**, not incidental:

| Content kind                             | Entitlement system unavailable → behavior                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free / core content**                  | **always plays** — no entitlement check is on the free path at all; commerce failure is invisible here                                                                                                     |
| **Premium content**                      | fall back to the **last cached entitlement** for the user; if no cache, fail **closed** (deny) — but with a clear, honest "we can't verify access right now, retry shortly" message, never a broken player |
| **Already-in-progress premium playback** | continues — an entitlement is verified at start, not re-checked mid-stream, so a viewer mid-video is never cut off by a commerce blip                                                                      |

The asymmetry is deliberate: free content **fails open** (it was always free);
premium content **fails closed but gracefully** (deny, explain, let them retry)
— and core playback is never coupled to commerce at all.

## 6. Auditability & observability

- Every grant and revoke is an event and a durable record — "why does/doesn't
  this user have access" is always answerable.
- Metrics: entitlement-check **latency** (a hot-path SLI), cache hit rate,
  revoke-propagation latency (revoke event → cache purged), reconciliation drift
  (entitlements corrected per run — should trend to ~0).

## 7. Events

`commerce.entitlement.granted.v1`, `commerce.entitlement.revoked.v1` — emitted by
`commerce-service`/`subscription-service`, consumed by the entitlement cache,
the content/playback path, and audit. Stream `commerce.events.v1`. Full catalog:
[economy-events.md](economy-events.md).

## Related documents

- [subscription-architecture.md](subscription-architecture.md) · [creator-monetization.md](creator-monetization.md) · [resilience.md](resilience.md) · [economy-events.md](economy-events.md)
