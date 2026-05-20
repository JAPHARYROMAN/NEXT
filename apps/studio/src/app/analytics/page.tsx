import { Surface } from '@next/ui';

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <Surface bordered className="p-6 text-sm text-muted">
        Creator analytics shell — ClickHouse-backed charts pending data contracts.
      </Surface>
    </div>
  );
}
