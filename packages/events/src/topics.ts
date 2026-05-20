import type { EventCategory } from './contracts/envelope';

// Topic catalog. The single source of truth for Kafka topics across NEXT.
// Phase 5 canonical topics use <category>.events.v<n>; legacy domain topics
// remain for services created in earlier phases until they migrate.

export const CATEGORY_TOPICS = {
  identity: 'identity.events.v1',
  session: 'session.events.v1',
  media: 'media.events.v1',
  playback: 'playback.events.v1',
  creator: 'creator.events.v1',
  community: 'community.events.v1',
  recommendation: 'recommendation.events.v1',
  search: 'search.events.v1',
  moderation: 'moderation.events.v1',
  commerce: 'commerce.events.v1',
  system: 'system.events.v1',
} as const satisfies Record<EventCategory, string>;

export const DEAD_LETTER_TOPICS = {
  identity: 'identity.events.dlq.v1',
  media: 'media.events.dlq.v1',
  playback: 'playback.events.dlq.v1',
  analytics: 'analytics.events.dlq.v1',
} as const;

export const REPLAY_TOPIC_PREFIX = 'replay';

export type CategoryTopicName = (typeof CATEGORY_TOPICS)[EventCategory];
export type DeadLetterTopicName = (typeof DEAD_LETTER_TOPICS)[keyof typeof DEAD_LETTER_TOPICS];

export function topicForCategory(category: EventCategory): CategoryTopicName {
  return CATEGORY_TOPICS[category];
}

export function deadLetterTopicForCategory(category: EventCategory): DeadLetterTopicName {
  if (category === 'identity' || category === 'media' || category === 'playback') {
    return DEAD_LETTER_TOPICS[category];
  }
  return DEAD_LETTER_TOPICS.analytics;
}

export const TOPICS = {
  // ---- Phase 5 canonical category streams ----
  IDENTITY_EVENTS_V1: CATEGORY_TOPICS.identity,
  SESSION_EVENTS_V1: CATEGORY_TOPICS.session,
  MEDIA_EVENTS_V1: CATEGORY_TOPICS.media,
  PLAYBACK_EVENTS_V1: CATEGORY_TOPICS.playback,
  CREATOR_EVENTS_V1: CATEGORY_TOPICS.creator,
  COMMUNITY_EVENTS_V1: CATEGORY_TOPICS.community,
  RECOMMENDATION_EVENTS_V1: CATEGORY_TOPICS.recommendation,
  SEARCH_EVENTS_V1: CATEGORY_TOPICS.search,
  MODERATION_EVENTS_V1: CATEGORY_TOPICS.moderation,
  COMMERCE_EVENTS_V1: CATEGORY_TOPICS.commerce,
  SYSTEM_EVENTS_V1: CATEGORY_TOPICS.system,

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
  REC_RECOMMENDATION_SERVED: 'rec.recommendation.served.v1',
  REC_RECOMMENDATION_CLICKED: 'rec.recommendation.clicked.v1',
  REC_RECOMMENDATION_SKIPPED: 'rec.recommendation.skipped.v1',
  REC_FEED_GENERATED: 'rec.feed.generated.v1',
  REC_DISCOVERY_MODE_CHANGED: 'rec.discovery.mode.changed.v1',
  REC_EXPLORATION_INJECTED: 'rec.exploration.injected.v1',

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

export type TopicName =
  | (typeof TOPICS)[keyof typeof TOPICS]
  | CategoryTopicName
  | DeadLetterTopicName;

export const DLQ = (topic: TopicName): string => `${topic}.dlq`;
