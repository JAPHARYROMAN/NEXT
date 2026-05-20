'use client';

import clsx from 'clsx';

export type CommunityMood = 'warm' | 'calm' | 'electric' | 'underground' | 'ritual';

const moodLabels: Record<CommunityMood, string> = {
  warm: 'Warm gathering',
  calm: 'Calm space',
  electric: 'Electric energy',
  underground: 'Underground',
  ritual: 'Scheduled ritual',
};

export interface MoodIndicatorProps {
  readonly mood: CommunityMood;
  readonly className?: string;
}

export function MoodIndicator({ mood, className }: MoodIndicatorProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-3 py-1 text-xs text-muted',
        className,
      )}
      role="status"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {moodLabels[mood]}
    </span>
  );
}
