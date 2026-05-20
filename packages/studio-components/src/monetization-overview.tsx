'use client';

import { AnimatedChart } from '@next/charts';
import { MetricTile } from './metric-tile';

const revenueTrend = [2, 3, 2.5, 4, 5, 4.8, 6];

export function MonetizationOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricTile label="Revenue (30d)" value="$4,280" delta="+12%" trend={revenueTrend} />
      <MetricTile label="Members" value="842" delta="+4%" />
      <MetricTile label="Tips" value="$620" delta="+18%" />
      <div className="md:col-span-3">
        <AnimatedChart
          title="Revenue streams"
          subtitle="Subscriptions · sponsorship · commerce — placeholder"
          data={[
            { label: 'Subs', value: 42 },
            { label: 'Sponsor', value: 28 },
            { label: 'Commerce', value: 18 },
            { label: 'Tips', value: 12 },
          ]}
        />
      </div>
    </div>
  );
}
