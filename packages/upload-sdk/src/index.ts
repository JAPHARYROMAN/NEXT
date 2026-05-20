// Browser-side resumable upload client. Chunking math + uploader state machine.

export interface ChunkPlan {
  readonly index: number;
  readonly offset: number;
  readonly size: number;
}

export const MIN_CHUNK = 5 * 1024 * 1024; // S3 multipart minimum (except last part)
export const MAX_CHUNK = 64 * 1024 * 1024;

/**
 * planChunks splits a file of `totalBytes` into chunks. `targetChunk` is clamped
 * to the S3 multipart bounds. The final chunk may be smaller than MIN_CHUNK.
 */
export function planChunks(totalBytes: number, targetChunk = 8 * 1024 * 1024): ChunkPlan[] {
  const chunk = Math.min(MAX_CHUNK, Math.max(MIN_CHUNK, targetChunk));
  const plans: ChunkPlan[] = [];
  let offset = 0;
  let index = 0;
  while (offset < totalBytes) {
    const size = Math.min(chunk, totalBytes - offset);
    plans.push({ index, offset, size });
    offset += size;
    index += 1;
  }
  return plans;
}

/**
 * adaptChunkSize tunes the next chunk size from observed throughput so each
 * chunk takes roughly `targetSeconds` — small chunks on slow mobile links,
 * large chunks on fast ones. Keeps upload resilient on flaky networks.
 */
export function adaptChunkSize(throughputBytesPerSec: number, targetSeconds = 4): number {
  const ideal = throughputBytesPerSec * targetSeconds;
  return Math.min(MAX_CHUNK, Math.max(MIN_CHUNK, Math.round(ideal)));
}

export type UploadState =
  | 'idle'
  | 'creating'
  | 'uploading'
  | 'paused'
  | 'finalizing'
  | 'done'
  | 'error';

export interface UploadProgress {
  readonly state: UploadState;
  readonly uploadedBytes: number;
  readonly totalBytes: number;
  /** 0..1 */
  readonly fraction: number;
}

export function progress(state: UploadState, uploaded: number, total: number): UploadProgress {
  return {
    state,
    uploadedBytes: uploaded,
    totalBytes: total,
    fraction: total > 0 ? Math.min(1, uploaded / total) : 0,
  };
}

/** nextResumeOffset: given the server's reported committed offset, where to resume. */
export function nextResumeOffset(
  committedOffset: number,
  plans: readonly ChunkPlan[],
): ChunkPlan | null {
  for (const p of plans) {
    if (p.offset >= committedOffset) return p;
  }
  return null;
}
