# Security Observability

> You cannot defend what you cannot see. Security observability is how NEXT
> detects an attack in progress, investigates it afterward, and proves what
> happened — built on the platform's observability stack, specialized for
> security signals.

## 0. Principle

Security observability extends the platform observability doctrine
([docs/standards/observability-standards.md](../standards/observability-standards.md),
[docs/resilience/sre-doctrine.md](../resilience/sre-doctrine.md)) with one extra
demand: the signals an _adversary_ generates must be **detectable in real time**
and **reconstructable after the fact**. Detection without forensics is blind to
the cause; forensics without detection is always too late.

## 1. Security telemetry

On top of the standard traces/metrics/logs, services emit **security signals**:

- authentication outcomes — success, failure, MFA challenge, step-up;
- authorization denials — a `PermissionDenied` is a signal, not just an error;
- rate-limit and abuse-throttle triggers;
- session events — creation, rotation, **retired-token replay**
  ([identity-session-security.md](identity-session-security.md));
- privileged and admin actions;
- anomalies flagged by risk intelligence.

These flow into the security telemetry pipeline (metrics + a dedicated security
event stream), separate from but correlated with general observability.

## 2. Anomaly detection

- **Authentication anomalies** — credential-stuffing patterns, impossible
  travel, abnormal failure spikes, new-device surges.
- **Authorization anomalies** — a principal suddenly probing endpoints it never
  used; a rising rate of denials.
- **Account-takeover signals** — a behavior break on a stable account
  ([identity-session-security.md](identity-session-security.md),
  [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)).
- **Workload anomalies** — a service making calls or egress connections it never
  made — a possible compromise ([incident-response.md](incident-response.md)).
- **Abuse / fraud** — financial and engagement abuse, via the trust & economy
  risk layers ([docs/economy/fraud-risk.md](../economy/fraud-risk.md)).

Detection reuses the graph + behavioral + event-driven model of risk
intelligence — security does not build a parallel detector where one exists.

## 3. Dashboards

- **Auth-anomaly dashboard** — login success/failure, MFA rates, suspicious-login
  volume, ATO signals.
- **Attack-surface dashboard** — edge/WAF activity, rate-limit triggers, DDoS
  indicators, denial rates by endpoint.
- **Privileged-access dashboard** — who accessed production, when, via what path
  (just-in-time vs. break-glass, [infrastructure-hardening.md](infrastructure-hardening.md)).
- **Security-event overview** — DLQ rates ([event-security.md](event-security.md)),
  anomaly volumes, open security cases.

## 4. Audit trails

- Every **privileged, administrative, financial, moderation, and
  security-relevant** action writes an immutable audit record on
  `audit.events.v1` ([docs/standards/security-standards.md](../standards/security-standards.md)).
- An audit record captures **actor, action, target, time, and basis** — enough
  to reconstruct _who did what, to what, and why_.
- Audit records are **append-only** and are **never** subject to decay or
  deletion ([docs/trust-safety/appeals-system.md](../trust-safety/appeals-system.md) §5).
- Staff and agent actions are audited identically — there is no unaudited
  privileged actor, human or AI.

## 5. Forensic logging

- Security-relevant logs are retained long enough to **investigate an incident
  discovered late** — intrusions are often found weeks after they begin.
- Forensic logs are **tamper-evident** — append-only, integrity-protected — so
  an attacker cannot quietly erase their trail.
- Logs carry correlation IDs so an investigator can reconstruct a full session
  or attack path across services ([docs/standards/observability-standards.md](../standards/observability-standards.md)).

## 6. Required signals — the floor

A production service **MUST** emit, for security:

- authentication and authorization outcomes (incl. denials);
- every privileged/admin action as an audit event;
- rate-limit / abuse-throttle triggers;
- enough correlation context to reconstruct an attack path.

A service that cannot show _who did what_ is not production-ready.

## 7. Retention doctrine

| Data                    | Retention                                                             |
| ----------------------- | --------------------------------------------------------------------- |
| Audit records           | the compliance retention period; never decay-deleted                  |
| Forensic security logs  | long enough to investigate a late-discovered intrusion                |
| General telemetry       | per the observability doctrine; shorter                               |
| Anything containing PII | minimized; per the [privacy](privacy-architecture.md) retention rules |

Retention is a balance: long enough to investigate, minimized enough to respect
privacy. Audit and forensic data are minimized in _content_ (no unnecessary
PII), not in _duration_.

## 8. Detection → response

Security observability is the **front of the incident pipeline** — a
high-confidence anomaly opens or escalates a security incident
([incident-response.md](incident-response.md)). Observability that detects but
never triggers a response is half a system; the detection-to-incident path is
explicit and tested.

## 9. Prohibited patterns

- ✗ A privileged action with no audit record.
- ✗ Mutable or deletable audit logs.
- ✗ An unaudited privileged actor (human or agent).
- ✗ Security logs too short-lived to investigate a late-discovered breach.
- ✗ PII in security telemetry.
- ✗ A detection signal with no path to an incident response.

## Related

- [docs/standards/observability-standards.md](../standards/observability-standards.md) · [incident-response.md](incident-response.md) · [identity-session-security.md](identity-session-security.md) · [docs/trust-safety/risk-intelligence.md](../trust-safety/risk-intelligence.md)
