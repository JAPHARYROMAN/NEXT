# Sponsorship Marketplace UI

Creator (`/sponsorships`, Studio `/sponsorships`) and sponsor workspace shells via `@next/sponsorship-ui`.

## Creator flow

1. Discover opportunities
2. Review proposal terms
3. Track deliverables checklist
4. Mandatory disclosure banner before publish

## Sponsor flow

- Campaign overview shell
- Creator discovery with fit scores
- Proposal review panel

## Trust

`CommerceSafetyWarning` and `SponsorshipDisclosureBadge` from `@next/reputation-ui`.

## State

`useSponsorshipWorkflowStore` — discover → proposal → deliverables → review → complete.

## Telemetry

`trackSponsorshipDropoff` at each workflow step.
