'use client';

import { AnimatedChart } from '@next/charts';
import { Badge } from '@next/ui';

const healthData = [
  { label: 'Bitrate', value: 8 },
  { label: 'Latency', value: 6 },
  { label: 'Frames', value: 9 },
  { label: 'Chat', value: 7 },
] as const;

export interface LiveHealthPanelProps {
  readonly status?: 'healthy' | 'degraded' | 'critical';
}

export function LiveHealthPanel({ status = 'healthy' }: LiveHealthPanelProps) {
  const tone = status === 'healthy' ? 'success' : status === 'degraded' ? 'accent' : 'danger';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Stream health</h3>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <AnimatedChart
        title="Realtime signals"
        subtitle="Mission-control viz — mock telemetry"
        data={[...healthData]}
      />
    </div>
  );
}
