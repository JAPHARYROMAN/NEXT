'use client';

import { Surface } from '@next/ui';
import { TimelineScrubber } from './timeline-scrubber';

export interface ClipPreviewProps {
  readonly title: string;
  readonly durationSec: number;
}

export function ClipPreview({ title, durationSec }: ClipPreviewProps) {
  return (
    <Surface bordered elevation="cinematic" className="p-4">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 aspect-video rounded-lg bg-elevated/80" aria-hidden />
      <TimelineScrubber className="mt-4" durationSec={durationSec} label="Clip in/out" />
    </Surface>
  );
}
