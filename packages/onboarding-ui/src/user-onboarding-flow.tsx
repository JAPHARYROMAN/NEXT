'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { OnboardingShell, StepNavigation } from '@next/identity-ui';
import { Surface } from '@next/ui';
import {
  advanceUserStep,
  retreatUserStep,
  useOnboardingStore,
  userStepIndex,
} from './store/onboarding-store';
import { useFirstRunStore } from './store/first-run-store';
import { ProfileStep } from './steps/profile-step';
import { InterestsStep } from './steps/interests-step';
import { DiscoveryStep } from './steps/discovery-step';
import { LocaleStep } from './steps/locale-step';
import { NotificationsStep } from './steps/notifications-step';
import { FeedPrepStep } from './steps/feed-prep-step';
import { trackOnboardingStep, trackPreferenceSelection } from './telemetry';
import { USER_ONBOARDING_STEPS, type UserOnboardingStep } from './types';

const OPTIONAL_STEPS: UserOnboardingStep[] = ['locale', 'privacy', 'notifications'];

export function UserOnboardingFlow() {
  const router = useRouter();
  const step = useOnboardingStore((s) => s.userStep);
  const setUserStep = useOnboardingStore((s) => s.setUserStep);
  const displayName = useOnboardingStore((s) => s.displayName);
  const setDisplayName = useOnboardingStore((s) => s.setDisplayName);
  const interests = useOnboardingStore((s) => s.interests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);
  const discoveryMode = useOnboardingStore((s) => s.discoveryMode);
  const setDiscoveryMode = useOnboardingStore((s) => s.setDiscoveryMode);
  const chaosOptIn = useOnboardingStore((s) => s.chaosOptIn);
  const setChaosOptIn = useOnboardingStore((s) => s.setChaosOptIn);
  const language = useOnboardingStore((s) => s.language);
  const region = useOnboardingStore((s) => s.region);
  const setLocale = useOnboardingStore((s) => s.setLocale);
  const notificationPrefs = useOnboardingStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useOnboardingStore((s) => s.setNotificationPrefs);
  const feedPrepared = useOnboardingStore((s) => s.feedPrepared);
  const markFeedPrepared = useOnboardingStore((s) => s.markFeedPrepared);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const activateFirstRun = useFirstRunStore((s) => s.activate);
  const setFirstRunPath = useFirstRunStore((s) => s.setPath);

  const [nameError, setNameError] = useState<string | undefined>();

  const stepIndex = userStepIndex(step);
  const steps = USER_ONBOARDING_STEPS;
  const isOptional = OPTIONAL_STEPS.includes(step);

  const title = useMemo(() => {
    const map: Record<UserOnboardingStep, string> = {
      profile: 'A few basics',
      interests: 'Your curiosities',
      discovery: 'How you want to discover',
      locale: 'Language & region',
      privacy: 'Privacy & trust',
      notifications: 'Stay in the loop',
      'feed-prep': 'Preparing your feed',
      complete: 'You are set',
    };
    return map[step];
  }, [step]);

  const goNext = useCallback(() => {
    if (step === 'profile' && displayName.trim().length < 2) {
      setNameError('Please enter at least 2 characters, or skip this step.');
      return;
    }
    setNameError(undefined);

    if (step === 'discovery') {
      trackPreferenceSelection('discovery_mode', discoveryMode);
      trackPreferenceSelection('chaos_opt_in', String(chaosOptIn));
    }

    if (step === 'feed-prep') {
      markFeedPrepared();
      completeOnboarding();
      activateFirstRun();
      setFirstRunPath('viewer');
      trackOnboardingStep('complete', { path: 'viewer' });
      setUserStep('complete');
      return;
    }

    const next = advanceUserStep(step);
    trackOnboardingStep(next);
    setUserStep(next);
  }, [
    step,
    displayName,
    discoveryMode,
    chaosOptIn,
    markFeedPrepared,
    completeOnboarding,
    activateFirstRun,
    setFirstRunPath,
    setUserStep,
  ]);

  const goBack = useCallback(() => {
    setUserStep(retreatUserStep(step));
  }, [step, setUserStep]);

  const skip = useCallback(() => {
    trackOnboardingStep(step, { skipped: true });
    setUserStep(advanceUserStep(step));
  }, [step, setUserStep]);

  const finish = useCallback(() => {
    router.push('/feed');
  }, [router]);

  if (step === 'complete') {
    return (
      <OnboardingShell title="Welcome aboard" subtitle="Your first-run guide is ready.">
        <Surface bordered className="space-y-4 p-6">
          <p className="text-sm text-muted">
            Preferences, privacy, and discovery mode can be changed anytime.
          </p>
          <button
            type="button"
            onClick={finish}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg"
          >
            Enter your feed
          </button>
        </Surface>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title={title}
      subtitle="Take your time — every step is optional except what matters to you."
      steps={steps}
      currentStepIndex={stepIndex}
      routeKey={step}
    >
      {step === 'profile' && (
        <ProfileStep
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          {...(nameError ? { error: nameError } : {})}
        />
      )}
      {step === 'interests' && <InterestsStep selected={interests} onToggle={toggleInterest} />}
      {step === 'discovery' && (
        <DiscoveryStep
          mode={discoveryMode}
          chaosOptIn={chaosOptIn}
          onModeChange={setDiscoveryMode}
          onChaosOptIn={setChaosOptIn}
        />
      )}
      {step === 'locale' && (
        <LocaleStep
          language={language}
          region={region}
          onLanguageChange={(l) => setLocale(l, region)}
          onRegionChange={(r) => setLocale(language, r)}
        />
      )}
      {step === 'privacy' && (
        <Surface bordered className="space-y-3 p-5 text-sm">
          <p className="text-muted">
            NEXT keeps personalization transparent. Review data controls on the account setup screen
            — no legal wall of text here.
          </p>
          <Link href="/account/setup" className="text-accent underline-offset-2 hover:underline">
            Open account & privacy setup
          </Link>
        </Surface>
      )}
      {step === 'notifications' && (
        <NotificationsStep prefs={notificationPrefs} onChange={setNotificationPrefs} />
      )}
      {step === 'feed-prep' && (
        <FeedPrepStep
          interestCount={interests.length}
          discoveryMode={discoveryMode}
          prepared={feedPrepared}
        />
      )}

      <StepNavigation
        {...(stepIndex > 0 ? { onBack: goBack } : {})}
        onNext={goNext}
        {...(isOptional ? { onSkip: skip, showSkip: true } : {})}
        nextLabel={step === 'feed-prep' ? 'Prepare feed' : 'Continue'}
      />
    </OnboardingShell>
  );
}
