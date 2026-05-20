'use client';

import { Surface, Button } from '@next/ui';
import { useUploadStore } from '@next/frontend-utils';

export function PublishingShell() {
  const metadata = useUploadStore((s) => s.metadata);
  const setMetadata = useUploadStore((s) => s.setMetadata);

  return (
    <Surface bordered className="space-y-4 p-6">
      <h3 className="text-sm font-medium">Publishing workflow</h3>
      <label className="block text-xs text-muted">
        Title
        <input
          className="mt-1 w-full rounded-lg border border-subtle/20 bg-elevated px-3 py-2 text-sm text-fg"
          value={metadata.title}
          onChange={(e) => setMetadata({ title: e.target.value })}
        />
      </label>
      <label className="block text-xs text-muted">
        Description
        <textarea
          className="mt-1 min-h-[80px] w-full rounded-lg border border-subtle/20 bg-elevated px-3 py-2 text-sm text-fg"
          value={metadata.description}
          onChange={(e) => setMetadata({ description: e.target.value })}
        />
      </label>
      <div className="flex gap-2">
        <Button variant="secondary">Thumbnail shell</Button>
        <Button variant="secondary">Subtitles shell</Button>
        <Button>Schedule publish</Button>
      </div>
    </Surface>
  );
}
