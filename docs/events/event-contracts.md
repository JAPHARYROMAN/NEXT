# Event Contracts

The canonical TypeScript contracts live in `packages/events/src/contracts`.

## Categories

- identity
- session
- media
- playback
- creator
- community
- recommendation
- search
- moderation
- commerce
- system

## Required v1 Event Types

Identity: `user_created`, `profile_updated`, `user_deleted`.

Session: `session_started`, `session_ended`, `device_registered`.

Media: `upload_started`, `upload_completed`, `media_processing_started`, `media_processing_completed`, `media_published`.

Playback: `playback_started`, `playback_paused`, `playback_resumed`, `playback_completed`, `playback_buffered`, `playback_seeked`, `playback_error`.

Creator: `creator_profile_created`, `creator_verified`, `creator_content_published`.

Recommendation: `feed_requested`, `recommendation_served`, `recommendation_clicked`, `recommendation_skipped`.

Search: `search_performed`, `search_result_clicked`.

Moderation: `content_flagged`, `moderation_action_taken`.

System: `service_started`, `service_error`, `background_job_completed`.

## Evolution Rules

- Add optional fields without changing the topic.
- Never remove or rename fields inside `*.v1`.
- Never add required fields to an existing schema.
- Breaking changes require a new `*.v2` topic and dual-write migration window.
- Every API contract change must update schemas, tests, docs, and affected consumers.
