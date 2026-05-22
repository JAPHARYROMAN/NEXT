'use client';

import { FocusTransition } from '@next/ambient-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useFocusLayoutStore } from '@next/frontend-utils';

export interface FocusFlowStep {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
}

export interface FocusFlowProps {
  readonly steps: readonly FocusFlowStep[];
  readonly className?: string;
}

export function FocusFlow({ steps, className }: FocusFlowProps) {
  const focusId = useFocusLayoutStore((s) => s.focusRegionId);
  const setFocusRegion = useFocusLayoutStore((s) => s.setFocusRegion);
  const step = steps.find((s) => s.id === focusId) ?? steps[0];

  return (
    <div className={clsx('space-y-4', className)} data-focus-flow>
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm',
              s.id === step?.id ? 'bg-brand/20 text-brand' : 'bg-surface text-muted hover:text-fg',
            )}
            onClick={() => setFocusRegion(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <FocusTransition visible={!!step}>
        <div>{step?.content}</div>
      </FocusTransition>
    </div>
  );
}
