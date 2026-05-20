// Event-payload types for the media + playback event family.
// Kept in lockstep with packages/events/schemas/media and packages/events/src/topics.ts.

export const MediaTopics = {
  videoIngested: 'media.video.ingested.v1',
  videoTranscoded: 'media.video.transcoded.v1',
  videoPublished: 'media.video.published.v1',
  processingStarted: 'media.processing.started.v1',
  processingStage: 'media.processing.stage.v1',
  processingCompleted: 'media.processing.completed.v1',
  processingFailed: 'media.processing.failed.v1',
  thumbnailGenerated: 'media.thumbnail.generated.v1',
  subtitleGenerated: 'media.subtitle.generated.v1',
  clipGenerated: 'media.clip.generated.v1',
  playbackStarted: 'playback.started.v1',
  playbackBuffered: 'playback.buffered.v1',
  playbackCompleted: 'playback.completed.v1',
} as const;

export type MediaTopic = (typeof MediaTopics)[keyof typeof MediaTopics];

/** Pipeline stages, mirroring ProcessingStage.Stage in the proto. */
export const ProcessingStage = [
  'transcode',
  'thumbnail',
  'subtitle',
  'understand',
  'index',
] as const;
export type ProcessingStage = (typeof ProcessingStage)[number];

export type StageStatus = 'succeeded' | 'failed';

export interface ProcessingStageEvent {
  readonly eventId: string;
  readonly emittedAt: string;
  readonly videoId: string;
  readonly runId: string;
  readonly stage: ProcessingStage;
  readonly status: StageStatus;
  readonly detail: string;
  readonly attempt: number;
}

export interface PlaybackStartedEvent {
  readonly eventId: string;
  readonly emittedAt: string;
  readonly sessionId: string;
  readonly videoId: string;
  readonly viewerId: string;
  readonly devicePlatform: string;
  readonly ipCountry: string;
  readonly startTimeMs: number;
  readonly initialRendition: string;
}
