// Branded identifier types. Cross-service IDs are ULIDs (sortable, URL-safe).
// Compile-time guarantees you don't pass a UserId where a VideoId is expected.

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Ulid = Brand<string, 'Ulid'>;

export type UserId = Brand<string, 'UserId'>;
export type CreatorId = Brand<string, 'CreatorId'>;
export type VideoId = Brand<string, 'VideoId'>;
export type LiveStreamId = Brand<string, 'LiveStreamId'>;
export type CommunityId = Brand<string, 'CommunityId'>;
export type PostId = Brand<string, 'PostId'>;
export type CommentId = Brand<string, 'CommentId'>;
export type CollectionId = Brand<string, 'CollectionId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type DeviceId = Brand<string, 'DeviceId'>;
export type UploadId = Brand<string, 'UploadId'>;
export type AssetId = Brand<string, 'AssetId'>;
export type PaymentIntentId = Brand<string, 'PaymentIntentId'>;
export type ModerationCaseId = Brand<string, 'ModerationCaseId'>;
export type EventId = Brand<string, 'EventId'>;
export type CorrelationId = Brand<string, 'CorrelationId'>;
export type TraceId = Brand<string, 'TraceId'>;

const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function isUlid(value: string): value is Ulid {
  return ULID_REGEX.test(value);
}

export function asUlid<B extends string>(value: string): Brand<string, B> {
  if (!isUlid(value)) {
    throw new TypeError(`expected ULID, got: ${value}`);
  }
  return value as Brand<string, B>;
}
