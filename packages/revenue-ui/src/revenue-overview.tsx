'use client';

import clsx from 'clsx';
import { useReducedMotion } from '@next/animation-system';
import { Surface } from '@next/ui';
import type { RevenueMetric } from './types';

function Sparkline({ values, label }: { values: readonly number[]; label: string }) {
  const reduced = useReducedMotion();
  const max = Math.max(...values, 1);
  const coords = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full text-accent" aria-label={`${label} trend`}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        points={coords}
        style={{ opacity: reduced ? 1 : undefined }}
      />
    </svg>
  );
}

export interface RevenueOverviewProps {
  readonly metrics: readonly RevenueMetric[];
  readonly className?: string;
}

export function RevenueOverview({ metrics, className }: RevenueOverviewProps) {
  return (
    <div className={clsx('grid gap-4 md:grid-cols-2 xl:grid-cols-4', className)}>
      {metrics.map((metric) => (
        <Surface key={metric.label} bordered className="p-4">
          <p className="text-xs text-muted">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-fg">{metric.value}</p>
          {metric.delta ? <p className="mt-1 text-xs text-emerald-300">{metric.delta}</p> : null}
          {metric.trend ? (
            <div className="mt-3">
              <Sparkline values={metric.trend} label={metric.label} />
            </div>
          ) : null}
        </Surface>
      ))}
    </div>
  );
}
