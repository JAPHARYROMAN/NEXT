// Topic catalog. The single source of truth for Kafka topics across NEXT.
// Naming convention: <domain>.<entity>.<event>.v<n>
//
// Partition key conventions follow [docs/event-architecture.md].

export const TOPICS = {
  // ---- Identity ----
  AUTH_USER_REGISTERED: 'auth.user.registered.v1',
  AUTH_SESSION_STARTED: 'auth.session.started.v1',
  AUTH_SESSION_ENDED: 'auth.session.ended.v1',
  AUTH_CREDENTIAL_ROTATED: 'auth.credential.rotated.v1',

  PROFILE_CREATED: 'profile.user.created.v1',
  PROFILE_UPDATED: 'profile.user.updated.v1',
  PROFILE_DELETED: 'profile.user.deleted.v1',
  PROFILE_FOLLOWED: 'profile.follow.created.v1',
  PROFILE_UNFOLLOWED: 'profile.follow.deleted.v1',

  // ---- Media ----
  MEDIA_UPLOAD_STARTED: 'upload.session.started.v1',
  MEDIA_UPLOAD_COMPLETED: 'upload.session.completed.v1',
  MEDIA_VIDEO_INGESTED: 'media.video.ingested.v1',
  MEDIA_VIDEO_TRANSCODED: 'media.video.transcoded.v1',
  MEDIA_VIDEO_PUBLISHED: 'media.video.published.v1',
  MEDIA_VIDEO_DELETED: 'media.video.deleted.v1',
  MEDIA_VIDEO_VIEWED: 'media.video.viewed.v1',

  // ---- Media processing pipeline ----
  MEDIA_PROCESSING_STARTED: 'media.processing.started.v1',
  MEDIA_PROCESSING_STAGE: 'media.processing.stage.v1',
  MEDIA_PROCESSING_COMPLETED: 'media.processing.completed.v1',
  MEDIA_PROCESSING_FAILED: 'media.processing.failed.v1',
  MEDIA_THUMBNAIL_GENERATED: 'media.thumbnail.generated.v1',
  MEDIA_SUBTITLE_GENERATED: 'media.subtitle.generated.v1',
  MEDIA_CLIP_GENERATED: 'media.clip.generated.v1',
  MEDIA_HIGHLIGHT_DETECTED: 'media.highlight.detected.v1',
  MEDIA_SEMANTIC_INDEXED: 'media.semantic.indexed.v1',

  // ---- Playback ----
  PLAYBACK_STARTED: 'playback.started.v1',
  PLAYBACK_BUFFERED: 'playback.buffered.v1',
  PLAYBACK_COMPLETED: 'playback.completed.v1',

  // ---- Live ----
  LIVE_STREAM_STARTED: 'live.stream.started.v1',
  LIVE_STREAM_ENDED: 'live.stream.ended.v1',
  LIVE_CHAT_MESSAGE: 'live.chat.message.v1',

  // ---- Feed / discovery ----
  FEED_IMPRESSION: 'feed.impression.v1',
  FEED_INTERACTION: 'feed.interaction.v1',
  REC_CANDIDATE_REQUESTED: 'rec.candidate.requested.v1',
  REC_RANKING_COMPLETED: 'rec.ranking.completed.v1',

  // ---- Social ----
  COMMUNITY_CREATED: 'community.community.created.v1',
  COMMUNITY_POST_CREATED: 'community.post.created.v1',
  COMMUNITY_PRESENCE_CHANGED: 'community.presence.changed.v1',

  // ---- Economic ----
  PAYMENT_INTENT_CREATED: 'payment.intent.created.v1',
  PAYMENT_INTENT_SUCCEEDED: 'payment.intent.succeeded.v1',
  PAYMENT_INTENT_FAILED: 'payment.intent.failed.v1',
  PAYMENT_PAYOUT_INITIATED: 'payment.payout.initiated.v1',

  // ---- Trust & safety ----
  MODERATION_CASE_OPENED: 'moderation.case.opened.v1',
  MODERATION_CASE_DECIDED: 'moderation.case.decided.v1',
  MODERATION_AUTOMATED_FLAG: 'moderation.flag.raised.v1',

  // ---- Notification ----
  NOTIFICATION_REQUESTED: 'notification.request.created.v1',
  NOTIFICATION_DELIVERED: 'notification.request.delivered.v1',

  // ---- Audit (compliance retention) ----
  AUDIT_PRIVILEGED_ACTION: 'audit.privileged.action.v1',

  // ---- Analytics terminal sink ----
  ANALYTICS_RAW: 'analytics.raw.v1',
} as const;

export type TopicName = (typeof TOPICS)[keyof typeof TOPICS];

export const DLQ = (topic: TopicName): string => `${topic}.dlq`;
