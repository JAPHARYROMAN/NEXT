'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface EventMetadata {
  readonly title: string;
  readonly creator: string;
  readonly category?: string;
  readonly startedAt?: string;
}

export interface EventMetadataPanelProps {
  readonly metadata: EventMetadata;
  readonly className?: string;
}

export function EventMetadataPanel({ metadata, className }: EventMetadataPanelProps) {
  return (
    <Surface bordered className={clsx('p-4 text-sm', className)} aria-label="Event metadata">
      <h2 className="font-display text-lg font-semibold">{metadata.title}</h2>
      <p className="mt-1 text-muted">{metadata.creator}</p>
      {metadata.category ? (
        <p className="mt-2 text-xs text-muted">Category · {metadata.category}</p>
      ) : null}
      {metadata.startedAt ? (
        <p className="mt-1 text-xs text-muted">Started {metadata.startedAt}</p>
      ) : null}
    </Surface>
  );
}
