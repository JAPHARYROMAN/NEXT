'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { OnboardingShell, StepNavigation, FieldGroup } from '@next/identity-ui';
import { Surface } from '@next/ui';
import clsx from 'clsx';
import {
  advanceCreatorStep,
  creatorStepIndex,
  useCreatorOnboardingStore,
} from './store/creator-onboarding-store';
import { useFirstRunStore } from './store/first-run-store';
import { trackCreatorActivation, trackOnboardingStep } from './telemetry';
import { CREATOR_ONBOARDING_STEPS } from './types';

const CREATOR_CATEGORIES = [
  'Film & video',
  'Music & audio',
  'Education',
  'Live performance',
  'Art & design',
  'Culture & commentary',
] as const;

export function CreatorOnboardingFlow() {
  const router = useRouter();
  const step = useCreatorOnboardingStore((s) => s.step);
  const setStep = useCreatorOnboardingStore((s) => s.setStep);
  const handle = useCreatorOnboardingStore((s) => s.handle);
  const displayName = useCreatorOnboardingStore((s) => s.displayName);
  const bio = useCreatorOnboardingStore((s) => s.bio);
  const setIdentity = useCreatorOnboardingStore((s) => s.setIdentity);
  const categories = useCreatorOnboardingStore((s) => s.categories);
  const toggleCategory = useCreatorOnboardingStore((s) => s.toggleCategory);
  const audienceGoal = useCreatorOnboardingStore((s) => s.audienceGoal);
  const setAudienceGoal = useCreatorOnboardingStore((s) => s.setAudienceGoal);
  const monetizationInterest = useCreatorOnboardingStore((s) => s.monetizationInterest);
  const setMonetizationInterest = useCreatorOnboardingStore((s) => s.setMonetizationInterest);
  const studioActivated = useCreatorOnboardingStore((s) => s.studioActivated);
  const activateStudio = useCreatorOnboardingStore((s) => s.activateStudio);
  const skipVerification = useCreatorOnboardingStore((s) => s.skipVerification);
  const complete = useCreatorOnboardingStore((s) => s.complete);
  const activateFirstRun = useFirstRunStore((s) => s.activate);
  const setFirstRunPath = useFirstRunStore((s) => s.setPath);

  const stepIndex = creatorStepIndex(step);

  const goNext = useCallback(() => {
    if (step === 'studio') activateStudio();
    if (step === 'upload') {
      complete();
      activateFirstRun();
      setFirstRunPath('creator');
      trackCreatorActivation('complete', step);
      setStep('complete');
      return;
    }
    const next = advanceCreatorStep(step);
    trackOnboardingStep(`creator_${next}`);
    setStep(next);
  }, [step, activateStudio, complete, activateFirstRun, setFirstRunPath, setStep]);

  const goBack = useCallback(() => {
    const order = CREATOR_ONBOARDING_STEPS.map((s) => s.id);
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]!);
  }, [step, setStep]);

  if (step === 'complete') {
    return (
      <OnboardingShell
        title="Creator space ready"
        subtitle="Studio, profile checklist, and upload prompt await."
      >
        <Surface bordered className="space-y-4 p-6">
          <Link
            href="http://localhost:3020/onboarding"
            className="block rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-bg"
          >
            Open NEXT Studio
          </Link>
          <button
            type="button"
            onClick={() => router.push('/profile/setup')}
            className="w-full rounded-lg border border-subtle/20 px-4 py-2 text-sm"
          >
            Finish public profile
          </button>
        </Surface>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="Creator onboarding"
      subtitle="Empowering setup — skip anything you are not ready to decide."
      steps={CREATOR_ONBOARDING_STEPS}
      currentStepIndex={stepIndex}
      routeKey={`creator-${step}`}
    >
      {step === 'identity' && (
        <Surface bordered className="space-y-4 p-5">
          <FieldGroup legend="Creator identity">
            <input
              type="text"
              placeholder="Handle"
              value={handle}
              onChange={(e) => setIdentity(e.target.value, displayName, bio)}
              className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
              aria-label="Creator handle"
            />
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setIdentity(handle, e.target.value, bio)}
              className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
              aria-label="Display name"
            />
            <textarea
              placeholder="Short bio"
              value={bio}
              onChange={(e) => setIdentity(handle, displayName, e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
              aria-label="Bio"
            />
          </FieldGroup>
          <p className="text-xs text-muted">Profile preview available on profile setup.</p>
        </Surface>
      )}

      {step === 'categories' && (
        <FieldGroup legend="Content focus">
          <ul className="flex flex-wrap gap-2">
            {CREATOR_CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  aria-pressed={categories.includes(cat)}
                  onClick={() => toggleCategory(cat)}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-sm',
                    categories.includes(cat)
                      ? 'border-accent/50 bg-accent/15'
                      : 'border-subtle/20 text-muted',
                  )}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </FieldGroup>
      )}

      {step === 'audience' && (
        <FieldGroup
          legend="Audience goals"
          description="Helps studio tips and discovery placement."
        >
          <textarea
            value={audienceGoal}
            onChange={(e) => setAudienceGoal(e.target.value)}
            rows={4}
            placeholder="Who do you create for? What feeling should they leave with?"
            className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
          />
        </FieldGroup>
      )}

      {step === 'monetization' && (
        <label className="flex items-start gap-3 rounded-xl border border-subtle/15 p-4 text-sm">
          <input
            type="checkbox"
            checked={monetizationInterest}
            onChange={(e) => setMonetizationInterest(e.target.checked)}
          />
          <span>
            <span className="font-medium text-fg">Interested in monetization later</span>
            <span className="mt-1 block text-muted">
              Placeholder — memberships, sponsorships, and store unlock when you choose.
            </span>
          </span>
        </label>
      )}

      {step === 'studio' && (
        <Surface bordered className="p-5 text-sm">
          <p className="text-muted">
            Activate your studio workspace — upload, live, analytics in one calm surface.
          </p>
          <p className="mt-3 text-fg">
            {studioActivated ? 'Studio activated (demo)' : 'Ready to activate'}
          </p>
        </Surface>
      )}

      {step === 'verification' && (
        <Surface bordered className="space-y-3 p-5 text-sm text-muted">
          <p>Verification placeholder — identity checks connect when trust service is live.</p>
          <button
            type="button"
            onClick={skipVerification}
            className="text-accent underline-offset-2 hover:underline"
          >
            Skip for now
          </button>
        </Surface>
      )}

      {step === 'upload' && (
        <Surface bordered className="p-5 text-sm">
          <p className="text-muted">First upload CTA — opens studio upload when you are ready.</p>
          <Link href="/upload" className="mt-3 inline-block text-accent hover:underline">
            Go to upload (placeholder route)
          </Link>
        </Surface>
      )}

      <StepNavigation
        {...(stepIndex > 0 ? { onBack: goBack } : {})}
        onNext={goNext}
        {...(step === 'monetization' || step === 'verification'
          ? { onSkip: goNext, showSkip: true }
          : {})}
        nextLabel={step === 'upload' ? 'Finish setup' : 'Continue'}
      />
    </OnboardingShell>
  );
}
