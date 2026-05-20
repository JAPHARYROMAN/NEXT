'use client';

import clsx from 'clsx';

export interface ModerationTransparencyProps {
  readonly actionsThisWeek: number;
  readonly appealsOpen?: number;
  readonly className?: string;
}

export function ModerationTransparency({
  actionsThisWeek,
  appealsOpen = 0,
  className,
}: ModerationTransparencyProps) {
  return (
    <aside
      className={clsx('rounded-lg border border-subtle/15 p-4 text-sm', className)}
      aria-label="Moderation transparency"
    >
      <h4 className="font-medium">Transparency shell</h4>
      <p className="mt-1 text-xs text-muted">
        {actionsThisWeek} moderation actions this week · contract-ready placeholder
      </p>
      <p className="mt-2 text-xs text-subtle">{appealsOpen} appeals in review queue</p>
    </aside>
  );
}
