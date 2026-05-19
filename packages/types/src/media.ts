import { z } from 'zod';
import type { AssetId, VideoId } from './ids';

export const VideoVisibility = ['public', 'unlisted', 'private', 'scheduled'] as const;
export type VideoVisibility = (typeof VideoVisibility)[number];

export const AssetKind = ['source', 'transcoded', 'thumbnail', 'sprite', 'caption', 'preview'] as const;
export type AssetKind = (typeof AssetKind)[number];

export interface VideoDimensions {
  readonly width: number;
  readonly height: number;
}

export interface VideoRendition {
  readonly assetId: AssetId;
  readonly codec: 'h264' | 'h265' | 'av1' | 'vp9';
  readonly resolution: VideoDimensions;
  readonly bitrateKbps: number;
  readonly bytes: number;
  readonly durationMs: number;
}

export interface VideoMetadata {
  readonly id: VideoId;
  readonly title: string;
  readonly visibility: VideoVisibility;
  readonly durationMs: number;
  readonly renditions: readonly VideoRendition[];
  readonly publishedAt: string | null;
}

export const VideoMetadataSchema = z.object({
  id: z.string().min(26).max(26),
  title: z.string().min(1).max(200),
  visibility: z.enum(VideoVisibility),
  durationMs: z.number().int().nonnegative(),
  renditions: z.array(z.unknown()).readonly(),
  publishedAt: z.string().datetime().nullable(),
});
