import { Surface } from '@next/ui';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Operations overview</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Surface bordered className="p-5">
          <p className="text-sm text-muted">Open moderation items</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </Surface>
        <Surface bordered className="p-5">
          <p className="text-sm text-muted">Trust queue depth</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </Surface>
      </div>
    </div>
  );
}
