import { Surface } from '@next/ui';

export default function AnalyticsOpsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics operations</h1>
      <Surface bordered className="p-6 text-sm text-muted">
        Product health, funnel diagnostics, and anomaly detection — warehouse queries pending.
      </Surface>
    </div>
  );
}
