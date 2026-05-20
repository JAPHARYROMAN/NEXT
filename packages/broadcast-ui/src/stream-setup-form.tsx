'use client';

import clsx from 'clsx';
import { Badge, Surface } from '@next/ui';
import type { StreamSetupDraft } from './types';

export interface StreamSetupFormProps {
  readonly draft: StreamSetupDraft;
  readonly onChange?: (field: keyof StreamSetupDraft, value: string) => void;
  readonly className?: string;
}

export function StreamSetupForm({ draft, onChange, className }: StreamSetupFormProps) {
  return (
    <Surface bordered className={clsx('space-y-4 p-5', className)} aria-label="Stream setup">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Event details</h3>
        <Badge tone="accent">{draft.visibility}</Badge>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">Title</span>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onChange?.('title', e.target.value)}
          className="w-full rounded-lg border border-subtle/20 bg-transparent px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">Description</span>
        <textarea
          value={draft.description}
          onChange={(e) => onChange?.('description', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-subtle/20 bg-transparent px-3 py-2"
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">Visibility</span>
        <select
          value={draft.visibility}
          onChange={(e) => onChange?.('visibility', e.target.value)}
          className="w-full rounded-lg border border-subtle/20 bg-transparent px-3 py-2"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="members">Members only</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted">Schedule (optional)</span>
        <input
          type="datetime-local"
          value={draft.scheduledAt ?? ''}
          onChange={(e) => onChange?.('scheduledAt', e.target.value)}
          className="w-full rounded-lg border border-subtle/20 bg-transparent px-3 py-2"
        />
      </label>
      <Surface className="border border-dashed border-subtle/25 p-4 text-xs text-muted">
        Poster / thumbnail upload — contract placeholder
      </Surface>
    </Surface>
  );
}
