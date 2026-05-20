# NEXT Creator Authenticity

> Authenticity is _"this creator is who and what they claim to be"_ — not
> _"this creator has revealed their legal identity"_. NEXT protects pseudonymous
> and anonymous creators while making impersonation, undisclosed manipulation,
> and synthetic deception detectable.

## 0. Doctrine

Authenticity systems exist to protect a viewer's ability to trust what they are
seeing, and a creator's ability to be **genuinely themselves** — including
behind a pseudonym. The hard rules:

1. **Pseudonymity is legitimate.** An anonymous or pseudonymous creator is a
   first-class citizen. Authenticity is never "show us your legal name".
2. **Artistic experimentation is protected.** Parody, fiction, persona work, and
   AI-as-medium are creative acts, not deception — when disclosed.
3. **Deception is the target.** Impersonating a real person, faking endorsement,
   passing synthetic media as real, hiding sponsorship — these are the harms.
4. **Disclosure beats prohibition.** NEXT labels and discloses far more than it
   bans. A disclosed AI-generated video is fine; an undisclosed one is the
   violation.

## 1. Creator verification

Verification confirms a _claim_, and the platform supports several kinds of
claim. Verification is **tiered and additive** — a creator holds zero or more
verification facts, not a single badge.

| Verification fact       | Confirms                                                                 | Method                                                         |
| ----------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| **Contactable**         | a working, controlled email/phone                                        | challenge-response                                             |
| **Consistent**          | account control is stable over time                                      | behavioral + device-graph signals                              |
| **Notable-identity**    | a public figure is genuinely this person                                 | evidence review (opt-in)                                       |
| **Org-affiliated**      | a creator represents a verified organization                             | org attestation                                                |
| **Authentic-pseudonym** | a pseudonymous creator is a stable, singular human, even though un-named | longevity + behavioral consistency + no impersonation findings |

The **authentic-pseudonym** fact is deliberate: it lets a pseudonymous creator
accrue verified standing _without_ surrendering anonymity. A pseudonymous
creator is not penalized for declining notable-identity verification.

Verification facts feed creator trust ([trust-architecture.md](trust-architecture.md)
§2.2) and emit `trust.creator.verified.v1`.

## 2. Authenticity scoring

An `authenticity_score` summarizes how confidently NEXT believes a creator is a
genuine, singular, non-deceptive actor. Signals:

- account/behavioral consistency (one human, not a hijacked or shared account);
- absence of upheld impersonation findings;
- originality of content (not a mass-clone account);
- disclosure compliance (synthetic media + sponsorship correctly labeled);
- verification facts held.

Authenticity is **decomposable and decaying**, like all trust signals. It is
_not_ a public ranking — it informs eligibility (e.g. monetization,
notable-identity workflows) and risk review priority, never recommendation
rank (see invariant 5 in [trust-architecture.md](trust-architecture.md)).

## 3. Impersonation detection

Impersonation — passing oneself off as another real creator, person, or org —
is detected by:

- **Profile similarity** — name, handle, avatar, bio near-duplication of an
  existing creator, especially a higher-profile one;
- **Content mirroring** — re-uploading another creator's catalog as one's own;
- **Voice/face matching** — vision/audio models flagging a creator's content
  presenting as a known different person;
- **Cross-signal** — a new account closely shadowing an established creator's
  identity surface.

Impersonation findings route to human review (it is high-context — homage,
parody, and common names are not impersonation). Confirmed impersonation is an
S1 enforcement matter ([platform-governance.md](platform-governance.md)).
Parody and fan accounts are legitimate **when clearly labeled as such**.

## 4. Synthetic media disclosure

NEXT treats AI-generated and AI-manipulated media as a **disclosure** problem.

- Creators **declare** synthetic or substantially-AI-manipulated content at
  upload; declared synthetic media carries a visible label.
- **Provenance** — NEXT supports content-provenance signatures (e.g. C2PA-style
  manifests) where present, and preserves them through transcoding.
- **Detection backstop** — vision/audio models estimate a `synthetic_likelihood`
  for _undeclared_ content; a high likelihood on undeclared media routes to
  review, not auto-removal.
- **Deepfake abuse** — synthetic media that depicts a real person without
  consent in a deceptive or harmful way is not a disclosure issue — it is an
  S0/S1 harm and routes to [risk-intelligence.md](risk-intelligence.md) and
  enforcement.

The line: _disclosed_ synthetic media is a creative medium and fully welcome;
_undisclosed_ synthetic media is a labeling violation; _non-consensual harmful_
synthetic media is abuse.

## 5. Sponsorship transparency

Paid promotion and sponsorship must be disclosed. NEXT provides a structured
**sponsorship declaration** on content; undeclared sponsorship detected by
review or signal is a transparency violation (S2), handled with labeling and
escalating friction rather than removal. The goal is an honest disclosure
norm, not punishment of commerce.

## 6. What authenticity systems must not do

- **Must not require de-anonymization.** No authenticity consequence may be
  escapable _only_ by revealing a legal identity.
- **Must not punish persona or fiction.** A disclosed character, alias, or
  AI-medium work is authentic.
- **Must not become a popularity tier.** Authenticity facts do not boost ranking
  ([recommendation-integration.md](recommendation-integration.md)).
- **Must not auto-remove on detection alone.** Synthetic-likelihood and
  impersonation-similarity are _review triggers_, not verdicts.

## 7. Events

| Event                               | Producer                        | Consumers                     |
| ----------------------------------- | ------------------------------- | ----------------------------- |
| `trust.creator.verified.v1`         | creator-verification (proposed) | trust-service, recommendation |
| `trust.impersonation.flagged.v1`    | authenticity detectors          | moderation pipeline           |
| `trust.synthetic_media.declared.v1` | media-service ingest            | recommendation, observability |

Stream: `trust.events.v1` ([ADR 0036](../adr/0036-event-topology.md)).

## Related documents

- [trust-architecture.md](trust-architecture.md) · [risk-intelligence.md](risk-intelligence.md) · [platform-governance.md](platform-governance.md)
