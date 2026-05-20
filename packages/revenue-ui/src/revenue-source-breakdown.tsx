'use client';

import { AnimatedChart } from '@next/charts';
import type { RevenueSource } from './types';

const SOURCE_LABELS: Record<RevenueSource, string> = {
  subscriptions: 'Subscriptions',
  tips: 'Tips',
  premium: 'Premium',
  sponsorship: 'Sponsorship',
  commerce: 'Commerce',
};

export interface RevenueSourceBreakdownProps {
  readonly sources: Readonly<Partial<Record<RevenueSource, number>>>;
}

export function RevenueSourceBreakdown({ sources }: RevenueSourceBreakdownProps) {
  const data = (Object.entries(sources) as [RevenueSource, number][]).map(([key, value]) => ({
    label: SOURCE_LABELS[key],
    value,
  }));

  return (
    <AnimatedChart
      title="Revenue by source"
      subtitle="Transparent breakdown — no hidden adjustments"
      data={data}
    />
  );
}
