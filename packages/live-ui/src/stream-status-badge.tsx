'use client';

import clsx from 'clsx';
import { Badge } from '@next/ui';

export type LiveStreamStatus = 'live' | 'starting' | 'ended' | 'replay';

export interface StreamStatusBadgeProps {
  readonly status: LiveStreamStatus;
  readonly className?: string;
}

const tone: Record<LiveStreamStatus, 'danger' | 'accent' | 'success'> = {
  live: 'danger',
  starting: 'accent',
  ended: 'accent',
  replay: 'success',
};

const label: Record<LiveStreamStatus, string> = {
  live: 'Live',
  starting: 'Starting soon',
  ended: 'Ended',
  replay: 'Replay',
};

export function StreamStatusBadge({ status, className }: StreamStatusBadgeProps) {
  return (
    <Badge tone={tone[status]} className={clsx(className)} aria-live="polite">
      {label[status]}
    </Badge>
  );
}
