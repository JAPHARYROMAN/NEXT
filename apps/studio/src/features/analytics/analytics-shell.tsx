'use client';

import { AnimatedChart, TimelineChart } from '@next/charts';
import { DashboardGrid } from '@next/layout-engine';
import { StudioPageHeader } from '@next/studio-components';
import { useAnalyticsFilterStore } from '@next/frontend-utils';

const surfaces = ['engagement', 'audience', 'retention', 'discovery', 'recommendation'] as const;

export function AnalyticsShell() {
  const surface = useAnalyticsFilterStore((s) => s.surface);
  const range = useAnalyticsFilterStore((s) => s.range);
  const setSurface = useAnalyticsFilterStore((s) => s.setSurface);
  const setRange = useAnalyticsFilterStore((s) => s.setRange);

  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Analytics"
        subtitle="Immersive creator metrics — not spreadsheet overload."
      />
      <div className="flex flex-wrap items-center gap-4">
        <select
          className="rounded-lg border border-subtle/20 bg-elevated px-3 py-2 text-sm"
          value={surface}
          onChange={(e) => setSurface(e.target.value as typeof surface)}
          aria-label="Analytics surface"
        >
          {surfaces.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-subtle/20 bg-elevated px-3 py-2 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
          aria-label="Date range"
        >
          <option value="7d">7 days</option>
          <option value="28d">28 days</option>
          <option value="90d">90 days</option>
          <option value="365d">365 days</option>
        </select>
      </div>
      <DashboardGrid columns={2}>
        <AnimatedChart
          title={`${surface} — weekly`}
          subtitle={`Range: ${range} · mock data`}
          data={[
            { label: 'W1', value: 5 },
            { label: 'W2', value: 7 },
            { label: 'W3', value: 6 },
            { label: 'W4', value: 9 },
          ]}
        />
        <TimelineChart
          title="Content performance timeline"
          segments={[
            { at: 'Mon', value: 42 },
            { at: 'Tue', value: 58 },
            { at: 'Wed', value: 51 },
            { at: 'Thu', value: 72 },
          ]}
        />
      </DashboardGrid>
    </div>
  );
}
