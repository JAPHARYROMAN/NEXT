# NEXT Risk Intelligence

> Most serious abuse is not one bad post — it is a _pattern_ across many
> accounts, over time. Risk intelligence is the system that sees the pattern:
> spam rings, bot farms, coordinated manipulation, fraud, and account takeover.

## 0. Doctrine

Risk intelligence detects **coordination and anomaly**, not individual content
(that is moderation). Its outputs are **risk signals**, not verdicts — they feed
trust, moderation prioritization, and adaptive friction; they rarely act
directly. The discipline:

- **Pattern over keyword** — detection is behavioral and graph-based, not
  blacklist-based.
- **Friction before punishment** — the first response to suspected abuse is
  _adaptive friction_ (challenges, rate limits), which a false positive barely
  notices and a true positive cannot scale through.
- **Coordination is the signal** — a thousand accounts each doing one slightly-
  odd thing is invisible per-account and obvious in aggregate.
- **Explainable and appealable** — a risk finding that drives a consequence is
  subject to the same notice + appeal rules as moderation
  ([appeals-system.md](appeals-system.md)).

## 1. The abuse classes

| Class                      | What it is                                                 |
| -------------------------- | ---------------------------------------------------------- |
| **Spam networks**          | many accounts posting coordinated promotional/scam content |
| **Bot farms**              | automated account fleets, often for fake engagement        |
| **Fake engagement**        | bought/botted views, likes, follows, comments              |
| **Manipulation rings**     | accounts mutually amplifying to game discovery             |
| **Recommendation gaming**  | engineered signals to exploit the ranking funnel           |
| **Influence operations**   | coordinated inauthentic narrative pushing                  |
| **Scam / fraud campaigns** | financial fraud, phishing, deceptive monetization          |
| **Account takeover (ATO)** | a legitimate account seized by an attacker                 |
| **Synthetic identity**     | fabricated personas, often at scale                        |

## 2. Detection architecture

Three complementary detectors feed one risk-scoring layer.

### 2.1 Behavioral anomaly detection

Per-account and per-cohort models over the event stream: posting cadence,
session shape, device/network churn, engagement-pattern outliers. Flags
accounts behaving unlike a human, or unlike their own history (an ATO signal:
a long-stable account abruptly changing behavior).

### 2.2 Graph analysis

The **trust/abuse graph** (Neo4j, [ADR 0023](../adr/0023-identity-graph-neo4j.md))
is the core tool. Nodes: accounts, content, devices, networks, payment
instruments. Detectors look for:

- **dense mutual-amplification subgraphs** — rings that like/follow/comment on
  each other in lock-step;
- **shared infrastructure** — clusters sharing devices, IP ranges, creation
  cohorts, or payment instruments;
- **star patterns** — one hub coordinating many spokes;
- **synchronized timing** — actions across "unrelated" accounts that co-occur
  too tightly to be independent.

Organic communities are graph-_diverse_; abuse rings are graph-_degenerate_ —
that structural difference is the discriminator.

### 2.3 Event-driven detection

Streaming detectors on the Kafka event bus catch fast-moving coordinated events
in near-real-time — a follow spike, a raid ([live-moderation.md](live-moderation.md)
§4), a coordinated comment flood — fast enough to trigger protective friction
while the event is still happening.

## 3. Risk scoring & response

Detector outputs fuse into a `risk_signal` per subject (account / ring /
campaign), carrying a confidence and a class. Response is **graduated**:

| Risk level                 | Response                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Low / ambiguous            | observe; raise monitoring; no user-visible effect                                    |
| Moderate                   | **adaptive friction** — proportionate challenges, rate limits, trust-aware throttles |
| High                       | suppress fake-engagement effects (see §4); route to human review                     |
| Confirmed coordinated harm | enforcement against the ring; `trust.coordinated_abuse.detected.v1`                  |

**Adaptive friction** is the workhorse. It scales with risk and inversely with
trust ([trust-architecture.md](trust-architecture.md)): a high-trust user in a
hot room sees almost nothing; a low-trust account in a suspected ring hits
challenges and tight rate limits. Friction degrades an attacker's economics
without a hard, appealable punishment landing on a maybe-false-positive.

## 4. Protecting the recommendation funnel

Fake engagement exists to game discovery. Risk intelligence protects the
recommendation system _without_ corrupting it:

- **Discount, don't delete** — engagement from accounts in a high-risk cluster
  is **discounted** as a ranking signal rather than the content being removed.
  Botted views simply stop counting; the content itself is judged by moderation
  on its own merits.
- **Ring-aware** — when a manipulation ring is confirmed, the discovery signals
  it manufactured are unwound, so the gamed content falls back to its organic
  standing.
- This keeps recommendation honest while ensuring an _attacked_ creator (someone
  botted _by an enemy_ to get them flagged) is not punished — the engagement is
  discounted, not weaponized against the victim.

## 5. Account-takeover & fraud

- **ATO** — behavioral anomaly detection on a stable account (sudden
  device/geo/behavior break) triggers a step-up identity challenge and protective
  limits before damage spreads; integrates with the identity/session services.
- **Fraud / scams** — payment-linked graph analysis and content-pattern signals
  identify scam campaigns; financial-harm cases are S1 and fast-tracked.
- **Synthetic identity** — creation-time and behavioral signals score new-account
  cohorts; suspected synthetic fleets get friction, not bans, until confirmed.

## 6. Coordinated abuse & influence operations

Coordinated inauthentic behavior — including influence operations — is treated
as a **network** finding, not a content finding. The platform acts on the
_coordination_ (the ring, the fleet), and the individual content is still judged
on its own merits by moderation. This separation matters: it prevents
"coordination" from becoming a backdoor to suppress legitimate organized
expression (a real grassroots movement is coordinated _and_ graph-diverse and
authentic; an influence op is coordinated _and_ graph-degenerate and
inauthentic).

## 7. Data

- **Graph (Neo4j)** — the trust/abuse graph; ring and fleet detection.
- **ClickHouse** — abuse-trend analytics, detector precision/recall tracking.
- **Vector store** — near-duplicate detection of scam-content templates.
- **PostgreSQL** — risk cases, ring records (per-service DB).

## 8. Events

| Event                                 | Producer                     | Consumers                                 |
| ------------------------------------- | ---------------------------- | ----------------------------------------- |
| `trust.coordinated_abuse.detected.v1` | risk-intelligence (proposed) | trust-service, moderation, recommendation |
| `trust.fake_engagement.detected.v1`   | risk-intelligence            | recommendation, trust-service             |
| `trust.account_takeover.suspected.v1` | risk-intelligence            | identity/session services, notification   |
| `moderation.live.raid_detected.v1`    | risk-intelligence            | live pipeline, operator console           |

Stream: `trust.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).

## 9. Observability

Detector precision/recall, false-positive rate (a tracked guardrail — friction
applied to legitimate users must stay low), abuse-trend dashboards, ring-size
distributions, time-to-detection for coordinated events.

## Related documents

- [trust-architecture.md](trust-architecture.md) · [moderation-pipelines.md](moderation-pipelines.md) · [live-moderation.md](live-moderation.md) · [recommendation-integration.md](recommendation-integration.md)
