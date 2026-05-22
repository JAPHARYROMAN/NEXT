import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const eventCategories = [
  'identity',
  'session',
  'media',
  'playback',
  'creator',
  'community',
  'recommendation',
  'search',
  'moderation',
  'commerce',
  'system',
] as const;

export const eventPlatforms = ['web', 'mobile', 'tv', 'service'] as const;

export type EventCategory = (typeof eventCategories)[number];
export type EventPlatform = (typeof eventPlatforms)[number];

const nullableUuid = z.string().uuid().nullable();
const nullableHash = z.string().min(16).max(128).nullable();
const stringId = z.string().min(1).max(128);
const nullableStringId = stringId.nullable();
const nonNegativeInt = z.number().int().nonnegative();

export const eventMetadataSchema = z
  .object({
    platform: z.enum(eventPlatforms),
    region: z.string().min(2).max(64),
    ip_hash: nullableHash,
    user_agent_hash: nullableHash,
  })
  .strict();

export type EventMetadata = z.infer<typeof eventMetadataSchema>;

const identityPayloads = {
  user_created: z
    .object({
      handle: z.string().min(3).max(30).optional(),
      email_hash: nullableHash.optional(),
      signup_source: z.string().max(64).optional(),
      consent_analytics: z.boolean(),
    })
    .strict(),
  profile_updated: z
    .object({
      changed_fields: z.array(z.string().min(1).max(64)).min(1),
      profile_version: z.number().int().positive(),
    })
    .strict(),
  user_deleted: z
    .object({
      deletion_reason: z.enum([
        'user_requested',
        'policy_action',
        'legal_request',
        'retention_expired',
      ]),
      anonymized: z.literal(true),
    })
    .strict(),
} as const;

const sessionPayloads = {
  session_started: z
    .object({
      auth_method: z.enum(['password', 'passkey', 'oauth', 'magic_link', 'service']),
      client_version: z.string().max(64).optional(),
    })
    .strict(),
  session_ended: z
    .object({
      duration_ms: nonNegativeInt,
      end_reason: z.enum(['logout', 'expired', 'revoked', 'client_closed', 'unknown']),
    })
    .strict(),
  device_registered: z
    .object({
      device_family: z.enum(['desktop', 'phone', 'tablet', 'tv', 'service']),
      os_family: z.string().min(1).max(64),
      push_enabled: z.boolean().optional(),
    })
    .strict(),
} as const;

const mediaPayloads = {
  upload_started: z
    .object({
      upload_id: stringId,
      file_size_bytes: nonNegativeInt,
      mime_type: z.string().min(3).max(128),
    })
    .strict(),
  upload_completed: z
    .object({
      upload_id: stringId,
      file_size_bytes: nonNegativeInt,
      duration_ms: nonNegativeInt,
      checksum_sha256: z.string().length(64),
    })
    .strict(),
  media_processing_started: z
    .object({
      pipeline_id: stringId,
      pipeline_version: z.string().min(1).max(64),
    })
    .strict(),
  media_processing_completed: z
    .object({
      pipeline_id: stringId,
      duration_ms: nonNegativeInt,
      renditions: z.array(z.string().min(1).max(32)).min(1),
    })
    .strict(),
  media_published: z
    .object({
      visibility: z.enum(['public', 'followers', 'unlisted', 'private']),
      tags: z.array(z.string().min(1).max(64)).max(32).default([]),
      language: z.string().min(2).max(16).optional(),
    })
    .strict(),
} as const;

const playbackPayloads = {
  playback_started: z
    .object({
      position_ms: nonNegativeInt,
      rendition: z.string().min(1).max(32).optional(),
      startup_latency_ms: nonNegativeInt.optional(),
    })
    .strict(),
  playback_paused: z.object({ position_ms: nonNegativeInt }).strict(),
  playback_resumed: z.object({ position_ms: nonNegativeInt }).strict(),
  playback_completed: z
    .object({
      duration_ms: nonNegativeInt,
      watch_time_ms: nonNegativeInt,
      completion_ratio: z.number().min(0).max(1),
    })
    .strict(),
  playback_buffered: z
    .object({
      position_ms: nonNegativeInt,
      buffer_duration_ms: nonNegativeInt,
      rendition: z.string().min(1).max(32).optional(),
    })
    .strict(),
  playback_seeked: z
    .object({
      from_ms: nonNegativeInt,
      to_ms: nonNegativeInt,
    })
    .strict(),
  playback_error: z
    .object({
      error_code: z.string().min(1).max(64),
      fatal: z.boolean(),
      position_ms: nonNegativeInt.optional(),
    })
    .strict(),
} as const;

const creatorPayloads = {
  creator_profile_created: z
    .object({
      creator_handle: z.string().min(3).max(30),
      category: z.string().min(1).max(64).optional(),
    })
    .strict(),
  creator_verified: z
    .object({
      verification_level: z.enum(['identity', 'organization', 'notable']),
      verified_by: z.string().min(1).max(128),
    })
    .strict(),
  creator_content_published: z
    .object({
      content_type: z.enum(['video', 'live', 'post', 'course', 'product']),
      visibility: z.enum(['public', 'followers', 'unlisted', 'private']),
    })
    .strict(),
} as const;

const communityPayloads = {
  community_created: z
    .object({
      community_id: z.string().uuid(),
      visibility: z.enum(['public', 'private', 'invite_only']),
    })
    .strict(),
  community_member_joined: z
    .object({
      community_id: z.string().uuid(),
      join_source: z.string().min(1).max(64).optional(),
    })
    .strict(),
} as const;

const recommendationPayloads = {
  feed_requested: z
    .object({
      surface: z.enum(['home', 'explore', 'creator', 'search', 'related']),
      request_reason: z.enum(['initial_load', 'pagination', 'refresh', 'preload']),
      limit: z.number().int().positive().max(200),
    })
    .strict(),
  recommendation_served: z
    .object({
      surface: z.enum(['home', 'explore', 'creator', 'search', 'related']),
      algorithm: z.string().min(1).max(128),
      candidate_count: nonNegativeInt,
      served_media_ids: z.array(stringId).max(200),
      experiment_ids: z.array(z.string().min(1).max(64)).max(32).default([]),
    })
    .strict(),
  recommendation_clicked: z
    .object({
      surface: z.enum(['home', 'explore', 'creator', 'search', 'related']),
      rank: nonNegativeInt,
      algorithm: z.string().min(1).max(128),
    })
    .strict(),
  recommendation_skipped: z
    .object({
      surface: z.enum(['home', 'explore', 'creator', 'search', 'related']),
      rank: nonNegativeInt,
      dwell_ms: nonNegativeInt,
    })
    .strict(),
} as const;

const searchPayloads = {
  search_performed: z
    .object({
      query_hash: nullableHash,
      query_length: z.number().int().min(0).max(512),
      filters: z.record(z.string(), z.string()).default({}),
      result_count: nonNegativeInt,
    })
    .strict(),
  search_result_clicked: z
    .object({
      query_hash: nullableHash,
      result_rank: nonNegativeInt,
      result_type: z.enum(['media', 'creator', 'community', 'commerce', 'learn']),
    })
    .strict(),
} as const;

const moderationPayloads = {
  content_flagged: z
    .object({
      content_type: z.enum(['media', 'profile', 'comment', 'live', 'community']),
      reason_code: z.string().min(1).max(64),
      source: z.enum(['user_report', 'automated_model', 'trusted_flagger', 'staff']),
    })
    .strict(),
  moderation_action_taken: z
    .object({
      action: z.enum(['no_action', 'age_gate', 'label', 'limit_distribution', 'remove', 'suspend']),
      reason_code: z.string().min(1).max(64),
      policy_version: z.string().min(1).max(64),
    })
    .strict(),
} as const;

const commercePayloads = {
  checkout_started: z
    .object({
      checkout_id: stringId,
      currency: z.string().length(3),
      amount_minor: nonNegativeInt,
    })
    .strict(),
  purchase_completed: z
    .object({
      checkout_id: stringId,
      currency: z.string().length(3),
      amount_minor: nonNegativeInt,
      payment_reference_hash: nullableHash,
    })
    .strict(),
} as const;

const systemPayloads = {
  service_started: z
    .object({
      service_name: z.string().min(1).max(128),
      service_version: z.string().min(1).max(64),
      environment: z.enum(['dev', 'staging', 'prod', 'test']),
    })
    .strict(),
  service_error: z
    .object({
      service_name: z.string().min(1).max(128),
      error_code: z.string().min(1).max(64),
      severity: z.enum(['debug', 'info', 'warn', 'error', 'critical']),
      retryable: z.boolean(),
    })
    .strict(),
  background_job_completed: z
    .object({
      job_name: z.string().min(1).max(128),
      duration_ms: nonNegativeInt,
      status: z.enum(['success', 'failed', 'cancelled']),
    })
    .strict(),
} as const;

export const eventPayloadSchemas = {
  ...identityPayloads,
  ...sessionPayloads,
  ...mediaPayloads,
  ...playbackPayloads,
  ...creatorPayloads,
  ...communityPayloads,
  ...recommendationPayloads,
  ...searchPayloads,
  ...moderationPayloads,
  ...commercePayloads,
  ...systemPayloads,
} as const;

export type EventType = keyof typeof eventPayloadSchemas;

export const eventCategoryByType = {
  user_created: 'identity',
  profile_updated: 'identity',
  user_deleted: 'identity',
  session_started: 'session',
  session_ended: 'session',
  device_registered: 'session',
  upload_started: 'media',
  upload_completed: 'media',
  media_processing_started: 'media',
  media_processing_completed: 'media',
  media_published: 'media',
  playback_started: 'playback',
  playback_paused: 'playback',
  playback_resumed: 'playback',
  playback_completed: 'playback',
  playback_buffered: 'playback',
  playback_seeked: 'playback',
  playback_error: 'playback',
  creator_profile_created: 'creator',
  creator_verified: 'creator',
  creator_content_published: 'creator',
  community_created: 'community',
  community_member_joined: 'community',
  feed_requested: 'recommendation',
  recommendation_served: 'recommendation',
  recommendation_clicked: 'recommendation',
  recommendation_skipped: 'recommendation',
  search_performed: 'search',
  search_result_clicked: 'search',
  content_flagged: 'moderation',
  moderation_action_taken: 'moderation',
  checkout_started: 'commerce',
  purchase_completed: 'commerce',
  service_started: 'system',
  service_error: 'system',
  background_job_completed: 'system',
} as const satisfies Record<EventType, EventCategory>;

export const eventTypesByCategory = eventCategories.reduce(
  (acc, category) => {
    acc[category] = Object.entries(eventCategoryByType)
      .filter(([, value]) => value === category)
      .map(([key]) => key as EventType);
    return acc;
  },
  {} as Record<EventCategory, EventType[]>,
);

export type EventPayload<TEventType extends EventType> = z.infer<
  (typeof eventPayloadSchemas)[TEventType]
>;

const baseEventEnvelopeSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string().min(1),
  event_version: z.literal('1.0'),
  event_category: z.enum(eventCategories),
  producer: z.string().min(1).max(128),
  timestamp: z.string().datetime({ offset: true }),
  user_id: nullableUuid,
  creator_id: nullableUuid,
  media_id: nullableStringId,
  session_id: nullableUuid,
  device_id: nullableStringId,
  request_id: z.string().max(256).nullable(),
  correlation_id: z.string().max(256).nullable(),
  idempotency_key: z.string().min(8).max(256),
  payload: z.record(z.string(), z.unknown()),
  metadata: eventMetadataSchema,
});

export const eventEnvelopeSchema = baseEventEnvelopeSchema.superRefine((event, ctx) => {
  if (!isEventType(event.event_type)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['event_type'],
      message: `Unknown event type: ${event.event_type}`,
    });
    return;
  }

  const expectedCategory = eventCategoryByType[event.event_type];
  if (event.event_category !== expectedCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['event_category'],
      message: `Event ${event.event_type} belongs to ${expectedCategory}`,
    });
  }

  const payloadResult = eventPayloadSchemas[event.event_type].safeParse(event.payload);
  if (!payloadResult.success) {
    for (const issue of payloadResult.error.issues) {
      ctx.addIssue({
        ...issue,
        path: ['payload', ...issue.path],
      });
    }
  }
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export function isEventType(value: string): value is EventType {
  return Object.prototype.hasOwnProperty.call(eventPayloadSchemas, value);
}

export function validateEventEnvelope(input: unknown): EventEnvelope {
  return eventEnvelopeSchema.parse(input);
}

export function safeValidateEventEnvelope(
  input: unknown,
): z.SafeParseReturnType<unknown, EventEnvelope> {
  return eventEnvelopeSchema.safeParse(input);
}

export interface CreateEventEnvelopeInput<TEventType extends EventType> {
  readonly event_type: TEventType;
  readonly producer: string;
  readonly payload: EventPayload<TEventType>;
  readonly metadata: EventMetadata;
  readonly event_id?: string;
  readonly timestamp?: string;
  readonly user_id?: string | null;
  readonly creator_id?: string | null;
  readonly media_id?: string | null;
  readonly session_id?: string | null;
  readonly device_id?: string | null;
  readonly request_id?: string | null;
  readonly correlation_id?: string | null;
  readonly idempotency_key?: string;
}

export function createEventEnvelope<TEventType extends EventType>(
  input: CreateEventEnvelopeInput<TEventType>,
): EventEnvelope {
  const eventId = input.event_id ?? randomUUID();
  const envelope = {
    event_id: eventId,
    event_type: input.event_type,
    event_version: '1.0',
    event_category: eventCategoryByType[input.event_type],
    producer: input.producer,
    timestamp: input.timestamp ?? new Date().toISOString(),
    user_id: input.user_id ?? null,
    creator_id: input.creator_id ?? null,
    media_id: input.media_id ?? null,
    session_id: input.session_id ?? null,
    device_id: input.device_id ?? null,
    request_id: input.request_id ?? null,
    correlation_id: input.correlation_id ?? null,
    idempotency_key: input.idempotency_key ?? `${input.producer}:${input.event_type}:${eventId}`,
    payload: input.payload,
    metadata: input.metadata,
  };
  return validateEventEnvelope(envelope);
}

export function partitionKeyForEvent(event: EventEnvelope): string {
  return (
    event.media_id ??
    event.creator_id ??
    event.user_id ??
    event.session_id ??
    event.device_id ??
    event.correlation_id ??
    event.event_id
  );
}
