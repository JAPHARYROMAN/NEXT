# Reputation UI

`@next/reputation-ui` provides trust surfaces without backend moderation logic.

## Components

| Component                 | Purpose                            |
| ------------------------- | ---------------------------------- |
| `ReputationBadge`         | Member score + tier label          |
| `TrustedContributorBadge` | Trusted contributor marker         |
| `CreatorVerification`     | Verified creator status            |
| `CommunityHealth`         | Health bar + signal list           |
| `ModerationTransparency`  | Weekly action counts (placeholder) |
| `AppealStatusPanel`       | Appeal lifecycle shell             |

## Contract readiness

Copy references "placeholder" and "API pending" where data would come from moderation/trust services. No calls to `community-service` or trust events packages in Phase 14.

## Usage

Embedded in community home aside rails and creator community headers.
