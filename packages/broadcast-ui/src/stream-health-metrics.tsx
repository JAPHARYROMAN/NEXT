'use client';

import clsx from 'clsx';
import { Badge, Surface } from '@next/ui';
import type { HealthSeverity, StreamHealthMetric } from './types';

const severityTone: Record<HealthSeverity, 'success' | 'accent' | 'danger'> = {
  ok: 'success',
  watch: 'accent',
  attention: 'danger',
};

export interface StreamHealthMetricsProps {
  readonly metrics: readonly StreamHealthMetric[];
  readonly overall?: HealthSeverity;
  readonly className?: string;
}

export function StreamHealthMetrics({
  metrics,
  overall = 'ok',
  className,
}: StreamHealthMetricsProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Stream health metrics">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Signal health</h3>
        <Badge tone={severityTone[overall]}>{overall}</Badge>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <li key={m.id} className="rounded-lg border border-subtle/15 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{m.label}</span>
              <Badge tone={severityTone[m.severity]}>{m.severity}</Badge>
            </div>
            <p className="mt-1 font-medium tabular-nums">{m.value}</p>
            {m.hint ? <p className="mt-0.5 text-xs text-muted">{m.hint}</p> : null}
          </li>
        ))}
      </ul>
    </Surface>
  );
}
