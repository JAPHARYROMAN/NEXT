'use client';

import clsx from 'clsx';
import { PageTransition } from '@next/animation-system';
import { OnboardingLayout } from '@next/layout-engine';
import type { ReactNode } from 'react';
import { StepProgress } from './step-progress';
import type { OnboardingStepMeta } from './types';

export interface OnboardingShellProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly steps?: readonly OnboardingStepMeta[];
  readonly currentStepIndex?: number;
  readonly aside?: ReactNode;
  readonly routeKey?: string;
  readonly className?: string;
}

export function OnboardingShell({
  title,
  subtitle,
  children,
  steps,
  currentStepIndex = 0,
  aside,
  routeKey = 'onboarding',
  className,
}: OnboardingShellProps) {
  return (
    <OnboardingLayout aside={aside}>
      <PageTransition routeKey={routeKey} className={clsx('mx-auto w-full max-w-xl', className)}>
        <header className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="max-w-prose text-sm text-muted">{subtitle}</p> : null}
        </header>
        {steps && steps.length > 0 ? (
          <div className="mt-8">
            <StepProgress steps={steps} currentIndex={currentStepIndex} />
          </div>
        ) : null}
        <div className="mt-8">{children}</div>
      </PageTransition>
    </OnboardingLayout>
  );
}
