'use client';

import {
  ActivityFeed,
  DashboardWidget,
  MetricTile,
  StudioPageHeader,
} from '@next/studio-components';
import { DashboardGrid } from '@next/layout-engine';
import { AnimatedChart } from '@next/charts';
import { useStudioWorkspaceStore } from '@next/frontend-utils';

const activity = [
  { id: '1', message: 'New resonance on "Calm horizons"', at: '2m' },
  { id: '2', message: 'Subscriber milestone approaching', at: '18m' },
  { id: '3', message: 'Discovery spike in ambient genre', at: '1h' },
] as const;

const viewsTrend = [4, 5, 4.2, 6, 7, 6.5, 8.2];

export function CreatorDashboard() {
  const panel = useStudioWorkspaceStore((s) => s.activePanel);
  const setPanel = useStudioWorkspaceStore((s) => s.setActivePanel);

  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Creator home"
        subtitle="Performance, publishing, and realtime signals — calm mission control."
      />
      <div className="flex flex-wrap gap-2">
        {(['overview', 'audience', 'publishing', 'realtime'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPanel(p)}
            className={
              panel === p
                ? 'rounded-lg bg-elevated px-3 py-1.5 text-sm'
                : 'rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-elevated/50'
            }
          >
            {p}
          </button>
        ))}
      </div>
      <DashboardGrid columns={3}>
        <MetricTile label="Views (7d)" value="128k" delta="+14%" trend={viewsTrend} />
        <MetricTile label="Resonances" value="4.2k" delta="+6%" />
        <MetricTile label="Watch time" value="842h" delta="+9%" />
        <DashboardWidget title="Publishing overview" description="Drafts and scheduled" span="wide">
          <p className="text-sm text-muted">3 drafts · 1 scheduled · 12 published</p>
        </DashboardWidget>
        <DashboardWidget title="Audience insights" description="Shell — data contracts pending">
          <AnimatedChart
            title="Returning viewers"
            data={[
              { label: 'New', value: 35 },
              { label: 'Return', value: 65 },
            ]}
          />
        </DashboardWidget>
        <DashboardWidget title="Recommendation insights" description="Discovery amplification">
          <p className="text-sm text-muted">Precision + expansion + chaos balance — placeholder.</p>
        </DashboardWidget>
        <DashboardWidget title="Realtime activity" span="wide">
          <ActivityFeed items={[...activity]} />
        </DashboardWidget>
      </DashboardGrid>
    </div>
  );
}
