// Streaming math shared by the player and the media services.

export type Codec = 'h264' | 'h265' | 'av1' | 'vp9';

export interface Rung {
  readonly name: string; // "720p"
  readonly width: number;
  readonly height: number;
  readonly codec: Codec;
  readonly bitrateKbps: number;
}

/** The default NEXT bitrate ladder — mirrors ADR 0025. */
export const DEFAULT_LADDER: readonly Rung[] = [
  { name: '360p', width: 640, height: 360, codec: 'h264', bitrateKbps: 800 },
  { name: '480p', width: 854, height: 480, codec: 'h264', bitrateKbps: 1400 },
  { name: '720p', width: 1280, height: 720, codec: 'h264', bitrateKbps: 3000 },
  { name: '1080p', width: 1920, height: 1080, codec: 'av1', bitrateKbps: 6000 },
  { name: '1440p', width: 2560, height: 1440, codec: 'av1', bitrateKbps: 12000 },
  { name: '2160p', width: 3840, height: 2160, codec: 'av1', bitrateKbps: 24000 },
];

/**
 * selectRung picks the highest ladder rung that fits within the measured
 * throughput, applying a safety factor so the buffer doesn't starve.
 * Returns the lowest rung when nothing fits.
 */
export function selectRung(
  ladder: readonly Rung[],
  throughputKbps: number,
  safetyFactor = 0.8,
): Rung {
  const budget = throughputKbps * safetyFactor;
  let chosen = ladder[0];
  for (const r of ladder) {
    if (r.bitrateKbps <= budget) chosen = r;
  }
  return chosen as Rung;
}

/**
 * contentAdaptiveLadder trims rungs above the source resolution — there is no
 * point encoding a 1080p source at 2160p. Mirrors the content-adaptive logic
 * in transcoding-service (ADR 0025).
 */
export function contentAdaptiveLadder(ladder: readonly Rung[], sourceHeight: number): Rung[] {
  return ladder.filter((r) => r.height <= sourceHeight);
}

/** Estimate buffer health in seconds given downloaded + played durations. */
export function bufferHealthSeconds(downloadedSec: number, playedSec: number): number {
  return Math.max(0, downloadedSec - playedSec);
}

/** rebufferRatio: fraction of watch time spent stalled. */
export function rebufferRatio(stalledMs: number, watchedMs: number): number {
  if (watchedMs <= 0) return 0;
  return stalledMs / (watchedMs + stalledMs);
}
