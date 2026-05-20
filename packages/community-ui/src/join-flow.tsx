'use client';

import clsx from 'clsx';
import { useCommunityOnboardingStore } from '@next/frontend-utils';

export interface JoinFlowProps {
  readonly communityName: string;
  readonly onJoin?: () => void;
  readonly className?: string;
}

export function JoinFlow({ communityName, onJoin, className }: JoinFlowProps) {
  const step = useCommunityOnboardingStore((s) => s.step);
  const setStep = useCommunityOnboardingStore((s) => s.setStep);
  const prefs = useCommunityOnboardingStore((s) => s.notificationPrefs);

  if (step === 'member') {
    return (
      <p className={clsx('text-sm text-accent', className)} role="status">
        You are part of {communityName}.
      </p>
    );
  }

  return (
    <div className={clsx('space-y-4 rounded-xl border border-subtle/15 p-5', className)}>
      <h3 className="font-medium">Join {communityName}</h3>
      {step === 'intro' ? (
        <>
          <p className="text-sm text-muted">
            A calm space for thoughtful discussion — no engagement farming, no rage ranking.
          </p>
          <button
            type="button"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
            onClick={() => setStep('prefs')}
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <fieldset className="space-y-2 text-sm">
            <legend className="sr-only">Notification preferences</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.rituals} readOnly aria-readonly />
              Ritual reminders
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.mentions} readOnly aria-readonly />
              Mentions only
            </label>
          </fieldset>
          <button
            type="button"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
            onClick={() => {
              setStep('member');
              onJoin?.();
            }}
          >
            Enter community
          </button>
        </>
      )}
    </div>
  );
}
