'use client';

import clsx from 'clsx';
import { Button } from '@next/ui';
import type { StepNavigationProps } from './types';

export function StepNavigation({
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Continue',
  backLabel = 'Back',
  skipLabel = 'Skip for now',
  nextDisabled = false,
  showSkip = false,
  isLoading = false,
}: StepNavigationProps) {
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 pt-6"
      aria-label="Onboarding navigation"
    >
      <div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showSkip && onSkip ? (
          <button
            type="button"
            onClick={onSkip}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm text-muted',
              'transition-colors hover:text-fg',
            )}
          >
            {skipLabel}
          </button>
        ) : null}
        {onNext ? (
          <Button onClick={onNext} disabled={nextDisabled || isLoading} aria-busy={isLoading}>
            {isLoading ? 'Saving…' : nextLabel}
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
