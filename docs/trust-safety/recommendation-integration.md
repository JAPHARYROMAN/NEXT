# NEXT Trust ↔ Recommendation Integration

> Trust must keep abuse out of the feed **without** quietly turning into a
> popularity bias or an algorithmic class system. This document is the contract
> between the integrity layer and the discovery layer.

## 0. The tension

The recommendation engine ([docs/recommendation](../recommendation/architecture.md))
optimizes for **resonance** and protects small/new creators with hard
anti-homogenization and fairness constraints ([ADR 0031](../adr/0031-anti-homogenization.md)).
Trust signals are useful to discovery — they keep scams, spam, and abuse out of
feeds. But the naïve integration is dangerous:

> If high trust → higher ranking, then trust becomes a proxy for incumbency.
> Established creators accrue trust, rank higher, gain reach, accrue more
> trust. That is exactly the rich-get-richer pathology ADR 0031 forbids — and
> it would build a permanent algorithmic class system.

So the integration is governed by one hard rule.

## 1. The hard rule

**Trust gates eligibility and discounts manipulation. Trust does not boost
ranking.**

- Trust may make content **ineligible** (abuse, confirmed harm) or **eligible
  with a label** (e.g. undisclosed-synthetic under review).
- Trust may cause manufactured engagement to be **discounted** so it stops
  inflating rank ([risk-intelligence.md](risk-intelligence.md) §4).
- Trust may **not** be a positive multiplier on `relevance`, `novelty`, or
  `final_score` in the ranking funnel. A high-trust creator and a neutral-trust
  creator with equally resonant content rank equally.

Trust is a **floor and a filter**, never a **boost**.

## 2. How trust enters the funnel

The four-stage funnel ([docs/recommendation/ranking-system.md](../recommendation/ranking-system.md))
integrates trust at exactly two points — both subtractive or neutral, never
additive.

| Funnel stage                   | Trust's role                                                                                          | Allowed?                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------- |
| Stage 0 — candidate generation | **Eligibility filter** — drop content that is removed, S0/S1-actioned, or from a confirmed abuse ring | Yes — a filter                  |
| Stage 1–2 — ranking            | Trust as a relevance/novelty boost                                                                    | **No** — forbidden by §1        |
| Stage 2 — engagement signals   | **Discount** engagement from high-risk clusters so botted signal does not lift rank                   | Yes — a discount, not a penalty |
| Stage 3 — diversity/fairness   | unchanged — fairness logic already protects new creators                                              | n/a                             |
| Stage 4 — final rerank         | Trust as a tie-break or boost                                                                         | **No**                          |

The only trust touchpoints are an **eligibility filter at stage 0** and an
**engagement discount at stage 2**. Neither can lift a high-trust creator above
a resonant low-trust one.

## 3. New creators are not penalized

Because new accounts start at **neutral trust, not zero**
([trust-architecture.md](trust-architecture.md) invariant 3):

- a brand-new creator's content is fully eligible at stage 0;
- it is subject to normal moderation, like everyone's;
- it is **not** filtered, throttled, or down-weighted _for being new_.

"Unproven" is not "distrusted". The exploration and long-tail guarantees of the
recommendation engine ([ADR 0031](../adr/0031-anti-homogenization.md)) — the
exploration floor, the long-tail recall budget — apply to new creators
unchanged. Trust integration must never erode them; that is a guardrail, below.

## 4. Creator discovery & trending

- **Creator discovery** surfaces — new-creator and niche-emergence feeds — use
  trust **only** as an abuse filter (keep scam/impersonation accounts out).
  They must not rank by trust, or "discovery" would only ever surface the
  already-established.
- **Trending** uses the engagement discount (§2): a trend manufactured by a
  manipulation ring is unwound, but an organic trend from a low-trust-because-new
  creator trends normally.
- **Community visibility** — community trust ([trust-architecture.md](trust-architecture.md)
  §2.3) affects how much **moderation autonomy** a community gets, not how high
  its content ranks.

## 5. Guardrail metrics

Trust↔recommendation integration is monitored with guardrail metrics, in the
same auto-aborting style as the recommendation experiment guardrails
([docs/recommendation/experimentation.md](../recommendation/experimentation.md)):

| Guardrail                               | Threshold                                                                              |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| Correlation(creator trust, served rank) | ≈ 0 — a rising correlation means trust is leaking into ranking                         |
| Exploration share                       | ≥ 15% — unchanged from ADR 0031; trust integration must not erode it                   |
| New-creator reach                       | within normal band — new creators must not lose reach after a trust-integration change |
| Eligibility-filter false-positive rate  | low and tracked — wrongly-filtered content is an appealable error                      |

A trust-integration change that moves any guardrail out of band is rejected —
the same discipline the recommendation engine already applies to itself.

## 6. Why this design

A platform that ranks by trust slowly sorts its creators into a permanent
hierarchy: the trusted are seen, the untrusted are not, and newness is
indistinguishable from untrustworthiness. NEXT's constitution and recommendation
doctrine reject that. By confining trust to **eligibility filtering** and
**manipulation discounting**, the integrity layer does its real job — keeping
abuse out of feeds — while the discovery layer stays free to surface a brilliant
video from an account that is six minutes old.

Protect users without killing culture. Protect the feed without building a
caste system.

## Related documents

- [trust-architecture.md](trust-architecture.md) · [risk-intelligence.md](risk-intelligence.md)
- [docs/recommendation/architecture.md](../recommendation/architecture.md) · [ADR 0031 — Anti-homogenization & creator fairness](../adr/0031-anti-homogenization.md)
