import { Surface } from '@next/ui';

export default function StudioDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Creator dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Surface bordered className="p-5">
          <p className="text-sm text-muted">Views (7d)</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </Surface>
        <Surface bordered className="p-5">
          <p className="text-sm text-muted">Subscribers</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </Surface>
        <Surface bordered className="p-5">
          <p className="text-sm text-muted">Revenue</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </Surface>
      </div>
    </div>
  );
}
