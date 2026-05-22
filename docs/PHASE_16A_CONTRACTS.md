# Phase 16A Contracts

Phase 16A defines the minimum schema surface for the runtime MVP flow:
auth -> profile -> upload/media -> feed/recommendation -> analytics/event-gateway -> api-gateway.

This PR is contracts only. It does not add service behavior, frontend code,
Terraform, or workflow changes.

## Service contracts

| Area                           | Contract                                                                                       | Phase 16A decision                                                                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth registration/session      | `next.auth.v1.UserService.RegisterUser`, `next.auth.v1.SessionService.Validate/Refresh/Revoke` | Existing proto already carries the MVP registration and token/session validation surface.                                                                  |
| Profile materialization/lookup | `next.profile.v1.ProfileService.Create/Get/Update`                                             | Existing proto already carries profile materialization and lookup by `user_id`.                                                                            |
| Upload/media registration      | `next.upload.v1.UploadService.Finalize`, `next.media.v1.MediaService.RegisterUpload`           | Added upload metadata handoff fields and a media registration RPC so upload finalization can become a media aggregate without product behavior in this PR. |
| Feed assembly/read             | `next.feed.v1.FeedService.GetFeed/RecordImpression`                                            | Added `slate_id`, `feed_view_id`, and impression position correlation for analytics and feed-view events.                                                  |
| Recommendation candidates      | `next.recommendation.v1.RecommendationService.Recommend/GetSlate`                              | Existing proto already carries candidate, slate, scored item, and diversity metrics.                                                                       |
| Analytics/event ingestion      | `packages/events/schemas/**` payload protos plus event-gateway envelope                        | Phase 16A adds the missing MVP payload schemas; runtime ingestion stays in later PRs.                                                                      |

## Domain events

Kafka topics remain category streams per ADR 0036. The values below are
envelope `event_type` values, not new Kafka topic names.

| Event payload                                        | Owning service           | Category stream            | Partition key | Status              |
| ---------------------------------------------------- | ------------------------ | -------------------------- | ------------- | ------------------- |
| `next.events.auth.v1.UserRegistered`                 | `auth-service`           | `identity.events.v1`       | `user_id`     | Existing schema.    |
| `next.events.identity.v1.ProfileCreated`             | `profile-service`        | `identity.events.v1`       | `user_id`     | Added in Phase 16A. |
| `next.events.media.v1.MediaUploaded`                 | `upload-service`         | `media.events.v1`          | `upload_id`   | Added in Phase 16A. |
| `next.events.recommendation.v1.FeedViewed`           | `feed-service`           | `recommendation.events.v1` | `user_id`     | Added in Phase 16A. |
| `next.events.recommendation.v1.RecommendationServed` | `recommendation-service` | `recommendation.events.v1` | `user_id`     | Existing schema.    |

## Generated code

Generated protobuf bindings remain out of git per
[`docs/git/generated-code-policy.md`](git/generated-code-policy.md). Developers
and CI regenerate with `buf generate` or `task codegen` before Go verification.

## Next implementation PR

After this contracts PR lands, the next implementation PR should wire the
auth-service runtime for registration/session behavior behind the existing
contract, then emit the existing `UserRegistered` payload.
