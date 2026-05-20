'use client';

import clsx from 'clsx';

export interface CommunityIdentityProps {
  readonly avatarLabel: string;
  readonly bannerLabel?: string;
  readonly tags?: readonly string[];
  readonly accentLabel?: string;
  readonly className?: string;
}

export function CommunityIdentity({
  avatarLabel,
  bannerLabel = 'Community banner',
  tags = [],
  accentLabel,
  className,
}: CommunityIdentityProps) {
  return (
    <div className={clsx('space-y-4', className)}>
      <div
        className="h-24 rounded-xl bg-gradient-to-r from-surface to-elevated md:h-32"
        role="img"
        aria-label={bannerLabel}
      />
      <div className="flex items-end gap-4">
        <div
          className="-mt-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-bg bg-elevated text-lg font-semibold"
          aria-label={`Avatar: ${avatarLabel}`}
        >
          {avatarLabel.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 space-y-2 pb-1">
          {accentLabel ? <p className="text-xs text-accent">Accent · {accentLabel}</p> : null}
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Community tags">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-surface/80 px-2.5 py-0.5 text-xs text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
