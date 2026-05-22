# Financial Fraud & Risk

> The systems that keep money safe — detecting stolen cards, refund abuse,
> payout fraud, sponsorship scams, and bot-driven revenue manipulation —
> integrated with NEXT's existing trust & safety layer rather than reinvented.

## 0. Principle

Financial fraud risk reuses, rather than duplicates, the risk doctrine already
established in [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md):
detect **coordination and anomaly**, respond with **friction before
punishment**, keep findings **explainable and appealable**. This document
applies that doctrine to money.

Owned by the proposed `fraud-risk-service` (Go), working alongside
`trust-service` and the existing `risk-intelligence` design.

## 1. The financial-fraud classes

| Class                               | What it is                                                           |
| ----------------------------------- | -------------------------------------------------------------------- |
| **Stolen cards**                    | payments on stolen/compromised payment instruments                   |
| **Refund abuse**                    | exploiting refunds — refund-after-consumption, serial refunding      |
| **Chargeback abuse**                | "friendly fraud" — charging back legitimately-consumed purchases     |
| **Payout fraud**                    | extracting money out — fraudulent payout accounts, hijacked earnings |
| **Sponsorship scams**               | fake brands phishing creators; off-platform payment lures            |
| **Fake-engagement monetization**    | botting engagement to manufacture revenue                            |
| **Revenue manipulation**            | bot-driven or coordinated inflation of earnings                      |
| **Account-takeover financial harm** | a hijacked account used to spend or to drain earnings                |

## 2. Where fraud risk integrates

`fraud-risk-service` is a consumer and a signal-producer, not an island:

- **The event bus** — it consumes `commerce.events.v1` (payments, refunds,
  payouts, subscriptions) and the playback/interaction streams.
- **`trust-service`** — a financial-fraud finding is a trust signal; a low trust
  score raises financial scrutiny. The trust score is shared context, per
  [docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md).
- **The identity graph** ([ADR 0023](../adr/0023-identity-graph-neo4j.md)) — the
  graph used for coordinated-abuse detection is the same one used to find fraud
  rings: shared payment instruments, shared devices, shared payout destinations.
- **Moderation** — a confirmed financial-fraud actor is also a trust & safety
  matter; the systems share findings.

It does not rebuild a graph, a trust model, or an event consumer that already
exists — it specializes them for money.

## 3. Detection

Three detectors, mirroring the trust-safety risk model:

- **Per-transaction signals** — velocity, geo/method mismatch, a new payment
  method spending fast, mismatch between a payment and the buying account's
  history. Stolen-card and ATO signals surface here, fast.
- **Behavioral anomaly** — refund/chargeback rate outliers, a payout pattern
  unlike a creator's earning pattern, a sudden payout-account change. Refund
  abuse and payout fraud surface here.
- **Graph analysis** — fraud _rings_: clusters sharing payment instruments,
  devices, or payout accounts; mutual-purchase rings inflating revenue;
  bot-fleet purchasing. Revenue manipulation and coordinated fraud surface here
  — a ring is graph-degenerate where an organic audience is graph-diverse.

## 4. Response — friction before punishment

Detector outputs fuse into a `risk_signal` (subject, class, confidence).
Response is graduated — the same ladder as trust-safety risk intelligence:

| Risk level      | Response                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Low / ambiguous | observe; raise monitoring; no user-visible effect                                                           |
| Moderate        | **adaptive friction** — step-up verification, payment challenges, trust-aware limits                        |
| High            | hold the affected money (a payout hold, [payouts.md](payouts.md) §5; a refund block); route to human review |
| Confirmed       | enforcement; `trust.fraud_risk.detected.v1`; recover funds where possible                                   |

Adaptive friction scales with risk and inversely with trust — a high-trust
creator barely notices; a high-risk new account hits verification walls. A false
positive experiences a brief, explained delay — never a silent confiscation.

## 5. Protecting creators and the ledger

Fraud controls are designed so an _innocent_ creator is protected, not punished:

- **Fake-engagement monetization** — when a creator's revenue is inflated by a
  bot ring, the manufactured purchases are **reversed and the revenue unwound**,
  consistent with [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)
  §4 (discount manipulation, do not weaponize it). Critically: a creator
  _attacked_ by an enemy botting fake purchases to get them flagged is **not**
  penalized — the transactions are reversed, the creator is not blamed.
- **Chargeback reserves** ([payouts.md](payouts.md) §4) absorb normal chargeback
  losses so ordinary fraud does not claw back from a creator's available balance.
- **Refund abuse** detection protects creators from serial-refunders who consume
  then reclaim.

## 6. Account-takeover & payout protection

- An ATO signal ([docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)
  §5) on an earning account triggers **payout protection** — payouts hold,
  payout-account changes require step-up identity confirmation — before an
  attacker can drain earnings.
- A payout-account change is itself a high-risk event: re-verification, a brief
  protective hold, and a notification to the creator on their existing channel.

## 7. Escalation & appeals

- A financial-fraud finding that drives a consequence (a hold, a reversal, an
  enforcement action) generates a **disclosed, explained notice** and an
  **appeal path** — the same explainable-recourse doctrine as moderation
  ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md)).
- High-severity or novel cases escalate to specialized human review.
- A creator whose money is held always learns why and can contest it. There is
  no silent, permanent financial punishment.

## 8. Events & observability

Events: `commerce.fraud_risk.detected.v1`, plus the trust-stream
`trust.fraud_risk.detected.v1` shared with trust & safety.

Observability: fraud-risk rate by class, friction-applied rate, false-positive
rate (a tracked guardrail — friction on legitimate users must stay low),
chargeback rate, refund-abuse rate, recovered-funds volume, time-to-detection.

## Related documents

- [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md) · [docs/trust-safety/trust-architecture.md](../trust-safety/trust-architecture.md) · [payouts.md](payouts.md) · [ledger-architecture.md](ledger-architecture.md)
