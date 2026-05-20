'use client';

import clsx from 'clsx';

export interface RitualBannerProps {
  readonly title: string;
  readonly scheduleLabel: string;
  readonly description?: string;
  readonly className?: string;
}

export function RitualBanner({ title, scheduleLabel, description, className }: RitualBannerProps) {
  return (
    <aside
      className={clsx('rounded-xl border border-accent/20 bg-accent/5 p-4 md:p-5', className)}
      aria-label="Community ritual"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Ritual moment</p>
      <h3 className="mt-1 font-display text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted">{scheduleLabel}</p>
      {description ? <p className="mt-2 text-sm text-subtle">{description}</p> : null}
    </aside>
  );
}
