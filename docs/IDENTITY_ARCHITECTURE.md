# NEXT — Identity Architecture

> The foundational identity ecosystem: authentication, authorization, sessions, trust, social graph, and personalization anchors.

NEXT identities are not accounts. They are persistent digital presence layers — creator ecosystems, trust entities, social-graph nodes, economic actors. This document is the canonical reference for how that ecosystem is structured.

Companion to [ARCHITECTURE.md](ARCHITECTURE.md). When the two conflict, this document wins for identity-domain concerns.

---

## Contents

1. [Doctrine](#1-doctrine)
2. [Service map](#2-service-map)
3. [Layered model](#3-layered-model)
4. [Authentication flows](#4-authentication-flows)
5. [Authorization model](#5-authorization-model)
6. [Sessions](#6-sessions)
7. [Profiles](#7-profiles)
8. [Device graph](#8-device-graph)
9. [Trust + safety](#9-trust--safety)
10. [Social identity graph](#10-social-identity-graph)
11. [Personalization anchor](#11-personalization-anchor)
12. [Data architecture](#12-data-architecture)
13. [API surface](#13-api-surface)
14. [Events](#14-events)
15. [Observability](#15-observability)
16. [Security posture](#16-security-posture)
17. [Frontends](#17-frontends)
18. [Scaling + DR](#18-scaling--dr)
19. [Roadmap](#19-roadmap)

---

## 1. Doctrine

Six invariants every identity decision is judged against:

1. **Identities are first-class.** Not a row in `users`; a layered entity composed of credentials, profile, devices, trust, and relationships.
2. **Bus before RPC.** Cross-service identity events flow through Kafka. Direct RPC is allowed only for read-time joins on the request path.
3. **Short-lived everything.** Access tokens 15 minutes, refresh tokens rotate on use, session SVIDs minutes. Long-lived secrets do not exist in this domain.
4. **Verify, don't trust.** Every internal call carries identity (SPIFFE workload + propagated user claims). Default-deny on every namespace.
5. **Humane defaults.** Security UX must be calm — passkeys preferred, friction added only when risk demands it.
6. **Reversible decisions.** Trust scores, tier upgrades, verification badges are all changeable state, not write-once attributes.

---

## 2. Service map

| Service                     | Owner                   | Status     | Role                                                                           |
| --------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------ |
| `auth-service`              | identity                | running    | Credentials, OIDC, JWT issuance, JWKS publisher.                               |
| `profile-service`           | identity                | running    | Profiles, handles, follows / mutes / blocks.                                   |
| `session-service`           | identity                | running    | Multi-device session backbone; refresh-token rotation; revocation propagation. |
| `device-graph-service`      | identity                | scaffolded | Trusted device inventory, anomaly scoring, cross-device continuity.            |
| `trust-service`             | trust-safety + identity | scaffolded | Account trust score, verification, anti-bot, behavior anomaly.                 |
| `identity-graph-service`    | identity                | scaffolded | Affinity + trust + interaction graph; Neo4j-backed.                            |
| `creator-identity-service`  | creator                 | scaffolded | Creator-tier identity, verification, payout-ready KYC integration.             |
| `access-control-service`    | identity + security     | scaffolded | RBAC + ABAC policy engine. Decisions per (subject, resource, action, context). |
| `account-recovery-service`  | identity                | scaffolded | Lost passkey / lost email flows; recovery codes; trusted-contact escalation.   |
| `notification-auth-service` | identity + messaging    | scaffolded | Out-of-band auth notifications (push challenge, email confirm).                |

```
                                  ┌──────────────────────────────────┐
                                  │   apps/auth-portal · account-center│
                                  └─────────────┬────────────────────┘
                                                │ GraphQL
                                  ┌─────────────▼────────────────────┐
                                  │           api-gateway              │
                                  │   (JWT verify · supergraph)        │
                                  └──────┬────────┬────────┬──────────┘
                                gRPC│        │        │
                                         ┌────────▼─┐ ┌────▼──────┐ ┌─▼───────────┐
                                         │   auth   │ │  profile  │ │   session    │
                                         │ service  │ │  service  │ │   service    │
                                         └────┬─────┘ └────┬──────┘ └──────┬──────┘
                                              │ events     │ events       │ events
                                              ▼            ▼              ▼
                                         ┌──────────────────────────────────────┐
                                         │            Kafka  (the bus)          │
                                         └─┬──────┬──────┬──────┬───────┬──────┘
                                           │      │      │      │       │
                                  device-graph  trust  identity-graph  creator-identity
                                                                       │
                                                                  access-control · account-recovery · notification-auth
```

---

## 3. Layered model

```
Layer 6  EXPERIENCE        auth-portal · account-center · web · mobile
Layer 5  GATEWAY           api-gateway (JWT verify, rate limit, federation router)
Layer 4  ISSUERS           auth-service · session-service
Layer 3  REPRESENTATION    profile-service · creator-identity-service
Layer 2  POLICY + SAFETY   access-control-service · trust-service
Layer 1  GRAPH + DEVICES   identity-graph-service · device-graph-service
Layer 0  RECOVERY + COMMS  account-recovery-service · notification-auth-service
```

Each layer depends only downward. A service never reaches up.

---

## 4. Authentication flows

The identity system supports six credential types. All flows funnel into a single primitive: **a verified credential → a session → a signed JWT pair**.

### 4.1 Credential types

| Kind                   | Use case       | Strength                       | Phase        |
| ---------------------- | -------------- | ------------------------------ | ------------ |
| **Passkey (WebAuthn)** | Primary        | Phishing-resistant             | Phase 5 base |
| **Password**           | Fallback       | Salted argon2id; rate-limited  | Phase 5 base |
| **Magic link**         | Onboarding     | Single-use, ≤ 15 min TTL       | Phase 6      |
| **OAuth**              | Bring-your-own | Google / Apple / GitHub        | Phase 6      |
| **Mobile platform**    | Native sign-in | Apple Sign In, Android One Tap | Phase 7      |
| **Wallet**             | Web3 surface   | EIP-4361 (SIWE)                | Phase 9      |

### 4.2 OAuth2 / OIDC flow (passkey example)

```
1. apps/web → /oauth/authorize (auth-portal redirect, PKCE)
2. User picks passkey → WebAuthn ceremony → POST /webauthn/login/verify
3. auth-service mints code → 302 to redirect_uri?code=…
4. Client POST /oauth/token { code, code_verifier }
5. auth-service:
     - Verifies code + PKCE
     - Asks session-service: CreateSession(user_id, method, device_id)
     - Receives session_id + family_id from session-service
     - Mints access_token (RS256 JWT, 15 min) + refresh_token (opaque, 7 days)
     - Emits auth.session.started.v1
6. Client stores tokens; uses access_token in Authorization: Bearer …
```

### 4.3 Token refresh

```
Client → POST /oauth/token { grant_type: refresh_token }
auth-service → session-service.Refresh(refresh_token)
session-service:
  - Verifies hash matches an unused token in the family
  - If used → revoke the entire family (theft signal) + emit alert
  - Otherwise mint new pair, mark previous as used
auth-service → mint new access_token from session-service's response
```

### 4.4 Revocation propagation

```
auth-service.Revoke(session_id)
  → session-service.Revoke
  → marks Postgres + Redis revocation cache + Kafka emit
  → every verifier (api-gateway, internal services) checks Redis on hit
```

Revocation TTL in Redis ≥ access-token TTL so cache covers the access-token window.

---

## 5. Authorization model

NEXT runs **hybrid RBAC + ABAC**.

- **RBAC** drives broad tier-based gates (`creator`, `staff`, `partner`).
- **ABAC** drives per-resource decisions (`can user U comment on video V given V.commentsClosed and U.muted`).

The `access-control-service` is the policy decision point (PDP). Every service is the policy enforcement point (PEP). Policies are written in **Rego** (OPA-style), bundled per service, hot-reloaded.

```
service receives request
  → extract claims from JWT (already verified at gateway)
  → call access-control-service.Authorize(input)
    or evaluate locally if the policy bundle is cached
  → enforce decision
```

Bundles are signed and pulled from a central manifest. See ADR 0022 (in this phase).

---

## 6. Sessions

`session-service` owns the session lifecycle, decoupled from credential verification (`auth-service`).

### Why split

- A session is **multi-device, multi-credential, replaceable**.
- An auth credential is **a means of acquiring a session**.
- Conflating them in Phase 1 was a pragmatic shortcut; we untangle now.

### Aggregates

- `Session` — `(id, user_id, family_id, method, device_id, ip_country, ua, started_at, last_active_at, expires_at, revoked_at)`
- `RefreshToken` — `(hash, session_id, family_id, issued_at, expires_at, used_at)` — rotation-friendly.
- `RevocationMarker` — Redis key `sess:revoked:<session_id>` with TTL ≥ access-token lifetime.

### gRPC

```
service SessionService {
  rpc Create(CreateRequest)     returns (CreateResponse);
  rpc Validate(ValidateRequest) returns (ValidateResponse);
  rpc Refresh(RefreshRequest)   returns (RefreshResponse);
  rpc Revoke(RevokeRequest)     returns (RevokeResponse);
  rpc List(ListRequest)         returns (ListResponse);   // for account-center
}
```

`auth-service.RegisterUser` calls `session-service.Create` on success; the returned session-id underpins the JWT's `sid` claim.

---

## 7. Profiles

`profile-service` (Phase 2) owns user-facing identity:

- Handle (citext unique)
- Display name, bio, avatar
- Tier (mirrors auth's user tier for fast reads; replicated via events)
- Follower / following counters (materialized from `follows`)

Profile mirrors `creator-identity-service` for creator-tier users via `creator-identity.linked-profile.v1`. Most consumers (feed, search, recommendation) read from `profile-service` regardless of tier.

---

## 8. Device graph

`device-graph-service` tracks the _device → user_ and _device → device_ relationships.

### Why a graph

- Sign-in from a new device + new geo + an old session active elsewhere = anomaly.
- Sign-in from a known device, known geo, normal UA = baseline.
- Same hardware fingerprint signing in as 200 different users in a week = farm.

### Data

- Nodes: `Device(id, fingerprint, ua_family, first_seen, last_seen)`.
- Edges: `(Device) — [SIGNED_IN] -> (User)` with weight + timestamp.
- Side index: per-device historical IP-country distribution.

### Risk score

Each session start triggers `device-graph-service.Score(user_id, device_id, ip_country)`. Returns 0–100. Above thresholds, downstream services may:

- Trigger step-up auth (notification-auth.PushChallenge).
- Lower the cap on sensitive actions (payments).
- Open a moderation case.

### Storage

Neo4j for the graph (per ADR in this phase). ClickHouse for time-series fingerprint counts.

---

## 9. Trust + safety

`trust-service` produces a per-account `trust_score` ∈ [0, 1] that gates trust-mediated actions (commenting threshold, ranking weight, payout eligibility).

### Inputs (Kafka-fed)

- `auth.session.started.v1` — frequency, location consistency.
- `profile.follow.created.v1` — graph centrality signals.
- `media.video.published.v1` — content authenticity heuristics.
- `moderation.case.decided.v1` — direct trust impact.

### Outputs

- `trust.score.updated.v1` — consumed by feed, recommendation, payment.
- `trust.verification.granted.v1` — when a tier is granted (`creator`, `partner`).

### Anti-abuse mechanisms

- Burst-rate scoring: > N actions of kind K in window W → temporary degradation.
- Coordination signals: graph clusters acting in lockstep get a soft flag.
- Hard CSAM / illegal content paths bypass trust scoring entirely (handled by `moderation-models`).

---

## 10. Social identity graph

`identity-graph-service` runs Neo4j as the **affinity + trust + interaction** graph.

Why a dedicated service rather than living in `profile-service`:

- Different read patterns (multi-hop, weighted).
- Different scaling shape (Neo4j vs Postgres).
- Different consistency story (eventual + replayable from events).

### Edges

| Edge              | From | To              | Weight                      |
| ----------------- | ---- | --------------- | --------------------------- |
| `FOLLOWS`         | User | User            | binary                      |
| `INTERACTED_WITH` | User | Content         | float (recency + dwell)     |
| `AFFINITY`        | User | Topic / Cluster | float (model-derived)       |
| `TRUSTS`          | User | User            | float (mutual + behavioral) |

### Consumers

- `recommendation-service` for multi-hop candidate gen.
- `search-service` for personalized re-ranking.
- `feed-service` for the social pillar of the timeline.

---

## 11. Personalization anchor

Every NEXT user has a personalization vector (`personalization_v1`, 1024-d, CLIP-XL aligned). Owned by `vector-pipelines` but **anchored to the identity**:

- Stored in Qdrant keyed by `user_id`.
- Updated on interaction events (delta updates).
- Erased on account deletion (right-to-erasure).
- Auditable per the constitution's humane defaults — users can view + reset the vector via `account-center`.

The identity layer does NOT consume the vector. It guarantees the vector's _lifecycle_ (creation on signup, erasure on deletion).

---

## 12. Data architecture

| Store                        | Service                   | Purpose                                          |
| ---------------------------- | ------------------------- | ------------------------------------------------ |
| Postgres `auth`              | auth-service              | users, credentials, oauth_clients                |
| Postgres `profile`           | profile-service           | profiles, follows, mutes, blocks                 |
| Postgres `session`           | session-service           | sessions, refresh_tokens                         |
| Postgres `device_graph`      | device-graph-service      | devices, signals (hot tier)                      |
| Postgres `trust`             | trust-service             | trust_scores, verifications, penalty_log         |
| Postgres `creator_identity`  | creator-identity-service  | creator records, kyc_state                       |
| Postgres `access_control`    | access-control-service    | roles, role_bindings, policy_bundles             |
| Postgres `account_recovery`  | account-recovery-service  | recovery_codes, trusted_contacts                 |
| Postgres `notification_auth` | notification-auth-service | challenges, delivery_log                         |
| Redis `auth`                 | auth + session            | rate-limit, session revocation cache, JWKS cache |
| Redis `device_graph`         | device-graph              | hot fingerprint cache                            |
| **Neo4j**                    | identity-graph            | the social + trust graph                         |
| ClickHouse `identity`        | trust + device-graph      | analytics, anomaly history                       |
| Qdrant                       | (via vector-pipelines)    | personalization vectors keyed by user_id         |
| Vault Transit                | auth                      | JWT signing keys (per ADR 0010)                  |

Migrations forward-only via `golang-migrate`. Each service's `migrations/` runs as a Helm pre-install hook.

---

## 13. API surface

### External (federated GraphQL)

The gateway exposes (Phase 4 base, extended this phase):

```graphql
type Query {
  me: User                        # NEW: requires JWT
  user(id: ID!): User
  followers(userId: ID!, …): FollowersConnection!
  following(userId: ID!, …): FollowersConnection!

  # NEW
  mySessions: [Session!]!         # for account-center
  myDevices: [Device!]!           # for account-center
  myTrustScore: Float             # may be null when score isn't computed
}

type Mutation {
  registerUser(input: RegisterUserInput!): RegisterUserResult!
  follow(input: FollowInput!): Boolean!
  unfollow(input: FollowInput!): Boolean!

  # NEW
  signIn(input: SignInInput!): TokenPair!
  refresh(input: RefreshInput!): TokenPair!
  signOut: Boolean!
  revokeSession(id: ID!): Boolean!
  approveDevice(id: ID!): Boolean!
}
```

### Internal (gRPC)

Each service exposes its proto under `services/<svc>/proto/<svc>/v1/`. All calls go through Istio mTLS. Workload identity via SPIFFE.

---

## 14. Events

Adds to the topic catalog (full list in [event-architecture.md](event-architecture.md)):

```
auth.user.registered.v1          (exists)
auth.session.started.v1          (exists; now carries device_id + ip_country)
auth.session.ended.v1            (exists)
auth.credential.rotated.v1       (exists)

session.created.v1               NEW — produced by session-service
session.refreshed.v1             NEW
session.revoked.v1               NEW
session.theft_detected.v1        NEW — refresh-token reuse

device.registered.v1             NEW
device.trusted.v1                NEW
device.revoked.v1                NEW
device.anomaly_detected.v1       NEW

trust.score.updated.v1           NEW
trust.verification.granted.v1    NEW
trust.verification.revoked.v1    NEW

access.role.granted.v1           NEW
access.role.revoked.v1           NEW
access.policy.published.v1       NEW

identity_graph.edge.upserted.v1  NEW
identity_graph.edge.removed.v1   NEW

recovery.code.issued.v1          NEW
recovery.flow.completed.v1       NEW
```

Partition keys per `event-architecture.md`. Retention per the family (auth = 7 days, audit = 7 years).

---

## 15. Observability

Per-domain dashboards (Grafana JSON in `infrastructure/monitoring/grafana/dashboards/`):

| Dashboard                     | Owner            | Key signals                                             |
| ----------------------------- | ---------------- | ------------------------------------------------------- |
| `identity-login-funnel`       | auth + session   | starts, completions, failures, latency P95              |
| `identity-token-health`       | auth             | JWT verify rate, JWKS fetch errors, key rotation events |
| `identity-trust-distribution` | trust            | score histogram, drift over time                        |
| `identity-device-graph`       | device-graph     | new devices/min, anomaly rate, geo dispersion           |
| `identity-recovery`           | account-recovery | recovery starts, completion rate                        |
| `identity-policy`             | access-control   | decision rate, deny ratio, bundle freshness             |

SLOs:

| SLO                             | Target   |
| ------------------------------- | -------- |
| Login completion availability   | 99.99 %  |
| JWT verify P99 latency          | < 10 ms  |
| Refresh availability            | 99.95 %  |
| Session revoke propagation P95  | < 2 s    |
| Device-anomaly-flag P95 latency | < 100 ms |
| Trust score staleness P99       | < 5 min  |

Burn-rate alerting per [observability.md](observability.md).

---

## 16. Security posture

| Control           | Implementation                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Workload identity | SPIFFE / SPIRE; auto-rotated SVIDs (per [ADR 0018](adr/0018-workload-identity.md))                               |
| Service mesh      | Istio strict mTLS, default-deny AuthorizationPolicy                                                              |
| JWT               | RS256, 15-min TTL, signing keys rotated weekly via Vault Transit. JWKS at `auth-service:/.well-known/jwks.json`. |
| Refresh tokens    | Opaque, hashed at rest (SHA-256), rotated on every use, family-revoke on reuse                                   |
| Rate limits       | Per-identity tier at gateway (Envoy + Redis). Per-credential brute-force lockout via `auth_redis`.               |
| Password storage  | Argon2id, m=64 MiB, t=3, p=1                                                                                     |
| Audit             | Every privileged identity action emits `audit.privileged.action.v1` — 7-year retention                           |
| Step-up auth      | High-risk actions trigger `notification-auth.PushChallenge`; gateway holds the request until approval            |
| Compliance        | SOC2 + GDPR right-to-erasure pathway via account-recovery-service                                                |

Threat model: ATO via credential stuffing (mitigated by rate limit + passkey-first), refresh-token theft (mitigated by family revoke), session token leakage (mitigated by short TTL + revocation cache), bot/farm signup (mitigated by device-graph + trust-service).

---

## 17. Frontends

### `apps/auth-portal`

Pure identity surface. Routes:

- `/sign-in` — passkey-first, password fallback, magic-link option
- `/sign-up` — handle + display name + passkey enroll
- `/recover` — recovery-code or trusted-contact flow
- `/oauth/consent` — third-party app consent (Phase 7)

Cinematic, calm, single column. No platform chrome. Hard CSP. Runs on Edge runtime where possible.

### `apps/account-center`

Authenticated surface for managing one's identity:

- `/profile` — handle, display name, bio, avatar
- `/security` — passkeys, password, recovery codes
- `/sessions` — active sessions (with revoke)
- `/devices` — trusted devices (with revoke)
- `/personalization` — view + reset personalization vector
- `/audit` — your own audit log

Same design tokens as `apps/web`. Sensitive views require step-up authentication.

---

## 18. Scaling + DR

Identity scales differently from feed/media:

- **Read-heavy** on JWT verify (every request) — solved by gateway-local JWKS cache + revocation Bloom.
- **Write-spike** on signup waves — auth-service horizontal; session-service horizontal; Postgres write-scale via service split.
- **Globally consistent** sessions are not required — eventual consistency on revocation is acceptable within the revocation TTL.

DR tiering (per [disaster-recovery.md](disaster-recovery.md)):

- **Tier 1** — auth-service, session-service: RPO < 1 min, RTO < 15 min.
- **Tier 2** — profile-service, device-graph-service, trust-service: RPO < 5 min, RTO < 1 hr.
- **Tier 3** — identity-graph-service, account-recovery-service, notification-auth-service.

Multi-region in v2:

- Aurora Global Database for tier-1 Postgres.
- Vault Transit replicated.
- Neo4j Causal Cluster across regions.
- Redis replication for revocation cache.

---

## 19. Roadmap

| Phase | Deliverable                                                                                  | Status         |
| ----- | -------------------------------------------------------------------------------------------- | -------------- |
| 5     | Identity architecture doc + 4 ADRs + 6 packages + JWT issuance + session-service + scaffolds | **this phase** |
| 6     | Real passkey ceremony, magic links, OAuth providers (Google, Apple, GitHub)                  | next           |
| 7     | OAuth2 platform (third-party clients consume our identity), `apps/auth-portal` real flows    |                |
| 8     | Device-graph anomaly model trained, trust-service v1 score, account-recovery flows           |                |
| 9     | Wallet auth (SIWE), creator identity verification (KYC integration), enterprise SSO          |                |
| 10    | Cross-region active-active, regional residency, autonomous-agent identity surface            |                |

Anything that violates the doctrine in [§1](#1-doctrine) does not ship, regardless of urgency.
