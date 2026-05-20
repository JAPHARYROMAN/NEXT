'use client';

import { Surface } from '@next/ui';
import type { RevenueHealth } from './types';

const healthCopy: Record<RevenueHealth, { label: string; detail: string; tone: string }> = {
  healthy: {
    label: 'Healthy',
    detail: 'Diversified income across multiple surfaces',
    tone: 'text-emerald-300',
  },
  stable: {
    label: 'Stable',
    detail: 'Predictable recurring revenue with room to grow',
    tone: 'text-sky-300',
  },
  attention: {
    label: 'Needs attention',
    detail: 'One source dominates — consider diversification',
    tone: 'text-amber-300',
  },
};

export interface RevenueHealthIndicatorProps {
  readonly health: RevenueHealth;
}

export function RevenueHealthIndicator({ health }: RevenueHealthIndicatorProps) {
  const copy = healthCopy[health];
  return (
    <Surface bordered className="p-5" aria-label="Revenue health">
      <p className="text-xs text-muted">Revenue health</p>
      <p className={`mt-1 text-lg font-medium ${copy.tone}`}>{copy.label}</p>
      <p className="mt-2 text-sm text-muted">{copy.detail}</p>
    </Surface>
  );
}
