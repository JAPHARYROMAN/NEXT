'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import { PresenceIndicator } from './presence-indicator';
import { AudienceAvatars } from './audience-avatars';
import { ActivityPulse } from './activity-pulse';

export interface RealtimePresenceShellProps {
  readonly count: number;
  readonly peak?: number;
  readonly avatars?: readonly string[];
  readonly activityLabel?: string;
  readonly className?: string;
}

export function RealtimePresenceShell({
  count,
  peak,
  avatars = ['AK', 'RM', 'JT', 'LV', 'NO', 'QP'],
  activityLabel = 'Steady engagement',
  className,
}: RealtimePresenceShellProps) {
  return (
    <Surface bordered className={clsx('space-y-3 p-4', className)} aria-label="Realtime presence">
      <PresenceIndicator count={count} />
      {peak != null ? (
        <p className="text-xs text-muted">Peak {peak.toLocaleString()} this session</p>
      ) : null}
      <AudienceAvatars initials={avatars} />
      <ActivityPulse label={activityLabel} intensity="medium" />
    </Surface>
  );
}
