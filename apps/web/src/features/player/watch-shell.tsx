'use client';

import { useEffect } from 'react';
import { PlayerShell, Surface, Button } from '@next/ui';
import { usePlayerStore } from '@next/frontend-utils';

export function WatchShell({ id, title }: { id: string; title: string }) {
  const open = usePlayerStore((s) => s.open);
  const setMode = usePlayerStore((s) => s.setMode);
  const mode = usePlayerStore((s) => s.mode);

  useEffect(() => {
    open(id, title, 'theater');
  }, [id, title, open]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PlayerShell mode={mode} title={title} />
      <Surface bordered className="p-6">
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant={mode === 'theater' ? 'primary' : 'secondary'}
            onClick={() => setMode('theater')}
          >
            Theater
          </Button>
          <Button
            size="sm"
            variant={mode === 'live' ? 'primary' : 'secondary'}
            onClick={() => setMode('live')}
          >
            Live
          </Button>
          <Button
            size="sm"
            variant={mode === 'clip' ? 'primary' : 'secondary'}
            onClick={() => setMode('clip')}
          >
            Clip
          </Button>
          <Button
            size="sm"
            variant={mode === 'mini' ? 'primary' : 'secondary'}
            onClick={() => setMode('mini')}
          >
            Mini
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted">
          Immersive player shell — streaming pipeline connects when media service contracts are
          wired.
        </p>
      </Surface>
    </div>
  );
}
