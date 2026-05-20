'use client';

import clsx from 'clsx';

export interface AudienceAvatarsProps {
  readonly initials: readonly string[];
  readonly max?: number;
  readonly className?: string;
}

export function AudienceAvatars({ initials, max = 5, className }: AudienceAvatarsProps) {
  const visible = initials.slice(0, max);
  const overflow = initials.length - visible.length;

  return (
    <ul className={clsx('flex -space-x-2', className)} aria-label="Audience avatars">
      {visible.map((init, i) => (
        <li
          key={`${init}-${i}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-elevated text-xs font-medium"
          title={init}
        >
          {init}
        </li>
      ))}
      {overflow > 0 ? (
        <li className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-surface text-xs text-muted">
          +{overflow}
        </li>
      ) : null}
    </ul>
  );
}
