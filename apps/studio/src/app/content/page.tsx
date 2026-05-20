import { Surface } from '@next/ui';

export default function ContentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Content management</h1>
      <Surface bordered className="p-6 text-sm text-muted">
        Drafts, scheduled publishes, and visibility controls — placeholder grid.
      </Surface>
    </div>
  );
}
