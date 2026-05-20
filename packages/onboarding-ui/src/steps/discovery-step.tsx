'use client';

import clsx from 'clsx';
import { FieldGroup } from '@next/identity-ui';
import type { FeedDiscoveryMode } from '../types';

const MODES: readonly { id: FeedDiscoveryMode; label: string; detail: string }[] = [
  {
    id: 'precision',
    label: 'Precision',
    detail: 'Relevant, intentional recommendations with minimal surprise.',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    detail: 'Adjacent interests and curiosity-led expansion.',
  },
  {
    id: 'chaos',
    label: 'Chaos',
    detail: 'Unexpected cultural emergence — optional and always dismissible.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    detail: 'Blend of relevance, expansion, and light serendipity.',
  },
];

export interface DiscoveryStepProps {
  readonly mode: FeedDiscoveryMode;
  readonly chaosOptIn: boolean;
  readonly onModeChange: (mode: FeedDiscoveryMode) => void;
  readonly onChaosOptIn: (enabled: boolean) => void;
}

export function DiscoveryStep({
  mode,
  chaosOptIn,
  onModeChange,
  onChaosOptIn,
}: DiscoveryStepProps) {
  return (
    <div className="space-y-6">
      <FieldGroup
        legend="Discovery mode"
        description="Controls how adventurous your feed feels. Personalization stays under your control."
      >
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Discovery mode">
          {MODES.map((m) => (
            <label
              key={m.id}
              className={clsx(
                'cursor-pointer rounded-xl border p-4 transition-colors',
                mode === m.id
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-subtle/15 hover:border-subtle/30',
              )}
            >
              <input
                type="radio"
                name="discovery-mode"
                value={m.id}
                checked={mode === m.id}
                onChange={() => onModeChange(m.id)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-fg">{m.label}</span>
              <p className="mt-1 text-xs text-muted">{m.detail}</p>
            </label>
          ))}
        </div>
      </FieldGroup>
      <label className="flex items-start gap-3 rounded-xl border border-subtle/15 p-4 text-sm">
        <input
          type="checkbox"
          checked={chaosOptIn}
          onChange={(e) => onChaosOptIn(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium text-fg">Invite chaos occasionally</span>
          <span className="mt-1 block text-muted">
            Rare surprise shelves in explore — never forced, never addictive.
          </span>
        </span>
      </label>
    </div>
  );
}
