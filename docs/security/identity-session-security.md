# Identity & Session Security

> Protecting the front door — how users and creators authenticate, how sessions
> stay safe, and how account takeover is detected and stopped — with friction
> scaled to risk so the honest user barely notices.

## 0. Principle

Identity is the most-attacked surface of any platform. NEXT's defense is
**risk-proportionate**: strong protections that stay invisible in a normal
session and escalate only when signals warrant. Security here is calm by
default, assertive on anomaly.

Grounded in [ADR 0012](../adr/0012-authentication.md) (OAuth2/OIDC + RS256 JWT)
and the identity ecosystem (auth, session, device-graph, account-recovery,
trust services).

## 1. Authentication

- Users and creators authenticate via **OAuth2 / OIDC**; the platform issues
  **RS256 JWTs** verified against a JWKS endpoint ([ADR 0012](../adr/0012-authentication.md)).
- Passwords, where used, are hashed with a memory-hard algorithm; NEXT never
  stores or logs a plaintext credential.
- The token-issuance keypair is held in Vault; the public JWKS is the only
  exposed half.
- Creator authentication is the same core flow with additional creator scopes —
  no weaker path for the higher-value account.

## 2. Sessions & token rotation

- A session is a short-lived **access token** + a longer-lived **refresh token**.
- **Refresh-token rotation** — every refresh issues a new refresh token and
  invalidates the old one. `session-service` already implements rotation with
  **theft detection**: if a _retired_ refresh token is presented, the whole
  token family is revoked — the signature of a stolen-token replay.
- Access tokens are short-lived so a leaked one expires fast; refresh tokens are
  rotated so a leaked one is single-use.
- Sessions are bound to context (device, [§4](#4-device-trust)); a session is
  revocable, and a user can see and revoke their active sessions.

## 3. MFA & passkeys

- **MFA** is offered to all users and is **strongly encouraged for creators and
  monetizing accounts** — the higher the account's value (reach, earnings), the
  stronger the default protection.
- MFA is **step-up**, not constant — it is required at signup of a new factor,
  on a risky action, or on an anomalous login (§5), not on every visit.
- **Passkeys / WebAuthn** are the strategic direction — phishing-resistant,
  hardware-backed authentication — designed-for as a first-class future factor.

## 4. Device trust

- `device-graph-service` models the devices associated with an account.
- A **known, consistent device** is a low-risk signal; a **new or anomalous
  device** raises session risk and can trigger step-up MFA.
- Device trust is a _risk input_, not a hard gate — a user on a new device is
  challenged, not locked out.

## 5. Suspicious-login & ATO detection

Account takeover is the headline threat. Detection signals
([security-observability.md](security-observability.md),
[docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)):

- impossible travel; an abrupt geo/ASN/device change;
- credential-stuffing patterns (many accounts, shared source, lock-step);
- a behavior break on a long-stable account;
- a retired-refresh-token replay (§2).

Response is graduated: low risk → observe; moderate → step-up MFA; high →
protective session limits + a notification on the user's known-good channel;
confirmed ATO → session revocation, a forced secure re-authentication, and
**creator payout protection** ([docs/economy/payouts.md](../economy/payouts.md))
so an attacker cannot drain earnings.

## 6. Account recovery

Recovery is a prime ATO vector — an attacker who can recover an account does not
need the password. So `account-recovery-service` is hardened:

- recovery requires **multiple, independent proofs**, not a single resettable
  factor;
- a recovery attempt is **risk-scored** like a login; a high-risk recovery
  escalates to stronger verification or a human-reviewed path;
- a recovery event **notifies every known channel** of the account, so a
  legitimate owner is alerted to an illegitimate attempt;
- recovery codes are single-use and stored hashed.

Recovery is deliberately harder than login — it is the last line, not a
shortcut.

## 7. Attack surface → mitigation

| Attack                 | Mitigation                                                              |
| ---------------------- | ----------------------------------------------------------------------- |
| Credential stuffing    | trust-aware rate limiting, anomaly detection, step-up MFA, passkeys     |
| Phishing               | passkeys (phishing-resistant); MFA; user education; honest auth UX      |
| Session hijacking      | short access tokens, refresh rotation + theft detection, device binding |
| Refresh-token theft    | rotation; a retired-token replay revokes the family                     |
| Account-recovery abuse | multi-proof recovery, risk scoring, multi-channel alerts                |
| Brute force            | rate limiting, lockout-with-backoff, MFA                                |
| Token forgery          | RS256 signatures; JWKS verification; the private key in Vault           |

## 8. Escalation

A confirmed or strongly-suspected identity compromise is a **security incident**
([incident-response.md](incident-response.md)) — credential-compromise and
creator-ATO playbooks apply. The user is always informed; the response is
explainable.

## 9. Prohibited patterns

- ✗ Storing or logging a plaintext credential or a raw token.
- ✗ A long-lived, non-rotating refresh token.
- ✗ A single-factor account-recovery path.
- ✗ Constant MFA friction on low-risk sessions (security-UX hostility).
- ✗ Locking out a user on a single new-device signal instead of challenging.
- ✗ A silent account-recovery with no owner notification.

## Related

- [zero-trust-architecture.md](zero-trust-architecture.md) · [service-authentication.md](service-authentication.md) · [incident-response.md](incident-response.md) · [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md) · [ADR 0012](../adr/0012-authentication.md)
