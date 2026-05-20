'use client';

import clsx from 'clsx';
import { Button } from '@next/ui';
import { trackInteraction } from '@next/frontend-utils';

export interface ContextualActionsProps {
  readonly onSave?: () => void;
  readonly onShare?: () => void;
  readonly className?: string;
}

export function ContextualActions({ onSave, onShare, className }: ContextualActionsProps) {
  const act = (action: string, fn?: () => void) => {
    const t0 = performance.now();
    fn?.();
    trackInteraction(action, 'contextual_actions', Math.round(performance.now() - t0));
  };

  return (
    <div
      className={clsx('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Media actions"
    >
      <Button size="sm" variant="secondary" onClick={() => act('save', onSave)}>
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={() => act('share', onShare)}>
        Share
      </Button>
      <Button size="sm" variant="ghost" onClick={() => act('appreciate')}>
        Appreciate
      </Button>
    </div>
  );
}
