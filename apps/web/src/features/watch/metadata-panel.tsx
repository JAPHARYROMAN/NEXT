'use client';

import { Surface } from '@next/ui';

export interface MetadataPanelProps {
  readonly title: string;
  readonly creator: string;
  readonly description: string;
}

export function MetadataPanel({ title, creator, description }: MetadataPanelProps) {
  return (
    <Surface bordered className="p-4">
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <p className="text-sm text-muted">{creator}</p>
      <p className="mt-2 text-sm text-subtle">{description}</p>
    </Surface>
  );
}
