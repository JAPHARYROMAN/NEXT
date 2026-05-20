// Client SDK for the media domain.

import type { VideoId, AssetId } from '@next/types';
import type { Rung } from '@next/streaming-utils';

export const VideoVisibility = ['public', 'unlisted', 'private', 'scheduled'] as const;
export type VideoVisibility = (typeof VideoVisibility)[number];

/** Mirrors media-service's processing state machine (MEDIA_ARCHITECTURE §3). */
export const ProcessingState = [
  'uploading',
  'uploaded',
  'ingested',
  'processing',
  'ready',
  'published',
  'failed',
] as const;
export type ProcessingState = (typeof ProcessingState)[number];

export interface Rendition {
  readonly assetId: AssetId;
  readonly rung: Rung;
  readonly bytes: number;
  readonly durationMs: number;
}

export interface Video {
  readonly id: VideoId;
  readonly creatorId: string;
  readonly title: string;
  readonly visibility: VideoVisibility;
  readonly state: ProcessingState;
  readonly durationMs: number;
  readonly renditions: readonly Rendition[];
  readonly publishedAt: string | null;
  readonly createdAt: string;
}

/** True when the video can be played (a transcode rendition exists). */
export function isPlayable(v: Video): boolean {
  return (v.state === 'ready' || v.state === 'published') && v.renditions.length > 0;
}

/** Build the manifest path for a video at a given protocol. */
export function manifestPath(videoId: VideoId, protocol: 'hls' | 'dash'): string {
  return protocol === 'hls' ? `/v/${videoId}/master.m3u8` : `/v/${videoId}/manifest.mpd`;
}

/** A media error surfaced to the UI — never leaks backend internals. */
export interface MediaError {
  readonly code: 'not_found' | 'not_ready' | 'forbidden' | 'unavailable';
  readonly message: string;
}
