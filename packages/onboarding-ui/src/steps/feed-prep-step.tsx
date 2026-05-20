'use client';

import { Surface } from '@next/ui';

export interface FeedPrepStepProps {
  readonly interestCount: number;
  readonly discoveryMode: string;
  readonly prepared: boolean;
}

export function FeedPrepStep({ interestCount, discoveryMode, prepared }: FeedPrepStepProps) {
  return (
    <Surface bordered className="space-y-4 p-5" aria-live="polite">
      <p className="text-sm text-muted">
        We are preparing a first feed shell — no backend sync in this demo; your choices are saved
        locally.
      </p>
      <ul className="space-y-2 text-sm text-fg">
        <li>{interestCount} interests selected</li>
        <li>Discovery mode: {discoveryMode}</li>
        <li>{prepared ? 'Feed shell ready' : 'Composing calm recommendations…'}</li>
      </ul>
      <div
        className="h-2 overflow-hidden rounded-full bg-subtle/20"
        role="progressbar"
        aria-valuenow={prepared ? 100 : 65}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Feed preparation"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: prepared ? '100%' : '65%' }}
        />
      </div>
    </Surface>
  );
}
