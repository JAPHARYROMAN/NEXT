import { Surface } from '@next/ui';

export default function HealthPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">System health</h1>
      <Surface bordered className="p-6 text-sm text-muted">
        Region status, SLO burn, and incident timeline — observability backends to be wired.
      </Surface>
    </div>
  );
}
