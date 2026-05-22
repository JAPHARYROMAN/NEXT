'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface BroadcastDashboardProps {
  readonly viewerCount: number;
  readonly chatRatePerMin?: number;
  readonly tipCount?: number;
  readonly className?: string;
}

export function BroadcastDashboard({
  viewerCount,
  chatRatePerMin = 0,
  tipCount = 0,
  className,
}: BroadcastDashboardProps) {
  return (
    <Surface
      bordered
      className={clsx('grid gap-4 p-4 sm:grid-cols-3', className)}
      aria-label="Broadcast dashboard"
    >
      <Stat label="Watching now" value={viewerCount.toLocaleString()} />
      <Stat label="Chat / min" value={String(chatRatePerMin)} />
      <Stat label="Appreciation" value={String(tipCount)} />
    </Surface>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
