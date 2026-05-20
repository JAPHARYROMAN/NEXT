'use client';

import clsx from 'clsx';
import { Badge, Button, Surface } from '@next/ui';
import type { ClipMarker } from './types';

export interface ClipHighlightPanelProps {
  readonly markers: readonly ClipMarker[];
  readonly onApprove?: (id: string) => void;
  readonly className?: string;
}

export function ClipHighlightPanel({ markers, onApprove, className }: ClipHighlightPanelProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Clips and highlights">
      <h3 className="text-sm font-medium">Clips & highlights</h3>
      <p className="mt-1 text-xs text-muted">
        Auto-highlight — placeholder · creator approval required
      </p>
      <ul className="mt-3 space-y-2">
        {markers.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-lg bg-surface/40 px-3 py-2 text-sm"
          >
            <div>
              <p>{m.label}</p>
              <p className="text-xs text-muted tabular-nums">{formatTime(m.atSec)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={m.status === 'approved' ? 'success' : 'accent'}>{m.status}</Badge>
              {m.status === 'pending' ? (
                <Button variant="ghost" onClick={() => onApprove?.(m.id)}>
                  Approve
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
