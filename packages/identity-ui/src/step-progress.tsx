'use client';

import clsx from 'clsx';
import type { OnboardingStepMeta } from './types';

export interface StepProgressProps {
  readonly steps: readonly OnboardingStepMeta[];
  readonly currentIndex: number;
  readonly className?: string;
  readonly label?: string;
}

export function StepProgress({
  steps,
  currentIndex,
  className,
  label = 'Onboarding progress',
}: StepProgressProps) {
  const total = steps.length;
  const current = steps[currentIndex];
  const pct = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between gap-4 text-xs text-muted">
        <span id="onboarding-step-label">
          Step {currentIndex + 1} of {total}
          {current ? `: ${current.label}` : ''}
        </span>
        <span aria-hidden="true">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-labelledby="onboarding-step-label"
        aria-label={label}
        className="h-1 overflow-hidden rounded-full bg-subtle/20"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="flex flex-wrap gap-2" aria-hidden="true">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={clsx(
              'h-1.5 w-6 rounded-full transition-colors',
              i <= currentIndex ? 'bg-accent/80' : 'bg-subtle/25',
              step.optional && i > currentIndex && 'opacity-60',
            )}
          />
        ))}
      </ol>
    </div>
  );
}
