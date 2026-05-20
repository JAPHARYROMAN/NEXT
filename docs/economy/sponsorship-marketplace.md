# Sponsorship Marketplace

> Where brands and creators meet to do sponsored work — designed so the deal is
> fair, the money is safe in escrow, the sponsorship is disclosed to the
> audience, and the creator never loses autonomy or trust.

## 0. Principle

A sponsorship marketplace can quietly become two bad things: a scam surface
(fake brands, non-paying brands, creators who take money and never deliver) and
a trust-erosion surface (undisclosed paid content). NEXT's marketplace is
designed against both. Four invariants:

1. **Creator autonomy** — a creator chooses every campaign; nothing is imposed.
2. **Money safety** — funds sit in **escrow**; neither side can be cheated.
3. **Audience trust** — sponsored content is **always disclosed**; this is
   non-negotiable.
4. **Anti-scam** — both brands and creators are verified; both are protected.

Owned by the proposed `sponsorship-service` (Go).

## 1. The participants

| Participant       | What it is                                                       |
| ----------------- | ---------------------------------------------------------------- |
| **Brand account** | a verified organization that runs sponsorship campaigns          |
| **Creator**       | discovers, accepts, and delivers campaigns                       |
| **Campaign**      | a brand's sponsorship offer — brief, deliverables, budget, terms |
| **Deliverable**   | a specific piece of sponsored content a creator commits to       |

Brand accounts are **verified** before they can run campaigns — an org
attestation ([docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md))
plus a financial check. An unverified entity cannot offer money to creators.

## 2. The campaign flow

```
 brand creates campaign ──▶ creator discovery ──▶ proposal to creator(s)
                                                        │
                                          creator reviews + accepts/declines
                                                        │ accept
                                                        ▼
              brand funds escrow ──▶ creator produces deliverable(s)
                                                        │
                                     deliverable submitted ──▶ brand reviews
                                                        │ approved
                                                        ▼
                          escrow releases ──▶ creator revenue ──▶ payout
```

1. **Create** — a brand defines a campaign: brief, deliverables, budget, terms.
2. **Discover** — the brand finds creators (§3) or invites specific creators.
3. **Propose** — a proposal goes to a creator; the creator sees the full terms.
4. **Accept** — the creator accepts or declines freely; acceptance forms the
   agreement.
5. **Fund escrow** — the brand funds an **escrow** account before work begins
   (§4).
6. **Deliver** — the creator produces the deliverable, disclosed as sponsored
   (§6).
7. **Approve** — the brand reviews against the agreed brief.
8. **Release** — on approval, escrow releases to the creator's revenue.

## 3. Creator discovery by sponsors

- Brands discover creators by audience fit, content domain, and aesthetic — but
  discovery is bounded by the same fairness principles as the recommendation
  system ([docs/trust-safety/recommendation-integration.md](../trust-safety/recommendation-integration.md)):
  small and niche creators are discoverable on relevance, not buried under reach.
- **Trust never becomes a sponsorship-discovery boost in the popularity sense** —
  a creator's authenticity and good standing make them _eligible_, not _ranked
  above_ equally-fit smaller creators.
- A creator controls their **sponsorship availability** and can opt out of
  discovery entirely. Discovery surfaces a creator; it never obligates them.

## 4. Escrow

Escrow is the core money-safety mechanism:

- the brand **funds escrow before the creator begins work** — a creator never
  produces sponsored work on an unfunded promise;
- escrowed funds are held in a dedicated ledger account
  ([ledger-architecture.md](ledger-architecture.md)) — neither freely the
  brand's nor yet the creator's;
- funds **release to the creator on deliverable approval** (§5);
- if a campaign is cancelled before delivery, escrow returns to the brand; if a
  creator delivers and the brand vanishes, the dispute process (§7) can release
  escrow to the creator.

Escrow is the structural answer to "the brand didn't pay" and "the creator took
the money and ran" — the money is committed and visible to both sides
throughout.

## 5. Deliverable tracking & approval

- Each deliverable has a state: `committed → submitted → approved` (or
  `revision_requested` / `disputed`).
- The brand reviews a submitted deliverable **against the agreed brief** — review
  is bounded by the agreement, so a brand cannot move the goalposts to withhold
  payment.
- Approval releases the deliverable's escrow portion; partial campaigns release
  per-deliverable.
- Review has a **deadline** — a brand that does not review within the window is
  treated as having approved, so a creator's payment cannot be held hostage by
  brand silence.

## 6. Disclosure — non-negotiable

Sponsored content is **always disclosed** to the audience:

- a deliverable produced through a campaign carries a **structured sponsorship
  declaration** and a visible label — this reuses the synthetic-media/disclosure
  machinery of [docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md) §5;
- the marketplace **cannot produce undisclosed sponsorship** — disclosure is
  attached at the campaign level and travels with the deliverable;
- undisclosed paid promotion discovered outside the marketplace is a
  transparency violation handled by trust & safety.

Audience trust is the asset the whole marketplace depends on; disclosure is how
it is protected.

## 7. Anti-scam & disputes

- **Both sides verified** — verified brand accounts; creators in good standing.
- **Escrow** (§4) removes the two classic scams structurally.
- **Reputation** — brands and creators accrue marketplace reputation from
  completed campaigns; a brand with a pattern of unfair rejections, or a creator
  with a pattern of non-delivery, is flagged.
- **Dispute resolution** — a contested deliverable enters a dispute flow:
  human review against the agreed brief and the submitted work, with the power
  to release escrow to the fair party. Disputes feed `fraud-risk-service`
  ([fraud-risk.md](fraud-risk.md)) — a brand or creator gaming disputes is a
  risk signal.
- **Sponsorship scams** (a fake "brand" phishing creators, an off-platform
  payment lure) are a fraud class ([fraud-risk.md](fraud-risk.md)); the
  marketplace steers all campaign money through escrow precisely so off-platform
  lures are visibly abnormal.

## 8. Events & observability

Events: `commerce.sponsorship.campaign_created.v1`,
`commerce.sponsorship.proposal_sent.v1`,
`commerce.sponsorship.campaign_accepted.v1`,
`commerce.sponsorship.deliverable_submitted.v1`,
`commerce.sponsorship.deliverable_approved.v1`,
`commerce.sponsorship.dispute_opened.v1` — stream `commerce.events.v1`
([economy-events.md](economy-events.md)).

Observability: campaign completion rate, deliverable approval rate, dispute
rate, time-to-approval, escrow held vs. released, brand/creator reputation
distributions.

## Related documents

- [creator-monetization.md](creator-monetization.md) · [ledger-architecture.md](ledger-architecture.md) · [fraud-risk.md](fraud-risk.md) · [docs/trust-safety/creator-authenticity.md](../trust-safety/creator-authenticity.md)
