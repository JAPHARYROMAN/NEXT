'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface IngestPlaceholdersProps {
  readonly streamKey?: string;
  readonly ingestUrl?: string;
  readonly className?: string;
}

export function IngestPlaceholders({
  streamKey = 'next_live_demo_key_••••',
  ingestUrl = 'rtmps://ingest.next.demo/live',
  className,
}: IngestPlaceholdersProps) {
  return (
    <Surface
      bordered
      className={clsx('space-y-3 p-4 text-sm', className)}
      aria-label="Ingest settings"
    >
      <h3 className="font-medium">Ingest (placeholder)</h3>
      <label className="block space-y-1">
        <span className="text-xs text-muted">Stream key</span>
        <input
          readOnly
          value={streamKey}
          className="w-full rounded-lg border border-subtle/20 bg-surface/40 px-3 py-2 font-mono text-xs"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted">Server URL</span>
        <input
          readOnly
          value={ingestUrl}
          className="w-full rounded-lg border border-subtle/20 bg-surface/40 px-3 py-2 font-mono text-xs"
        />
      </label>
      <p className="text-xs text-muted">No real RTMP/WebRTC — contract-ready for encoder wiring.</p>
    </Surface>
  );
}
