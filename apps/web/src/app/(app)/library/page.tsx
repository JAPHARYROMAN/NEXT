import { Surface } from '@next/ui';

export const metadata = { title: 'Library' };

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Library</h1>
      <Surface bordered className="p-6">
        <p className="text-sm text-muted">
          Saved, history, and playlists — synced when library API is available.
        </p>
      </Surface>
    </div>
  );
}
