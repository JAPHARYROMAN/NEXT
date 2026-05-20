'use client';

import Link from 'next/link';
import { OnboardingShell, StepNavigation, FieldGroup } from '@next/identity-ui';
import { Surface } from '@next/ui';
import { useCreatorOnboardingStore } from './store/creator-onboarding-store';
import { trackCreatorActivation } from './telemetry';

export function StudioOnboardingExperience() {
  const studioActivated = useCreatorOnboardingStore((s) => s.studioActivated);
  const activateStudio = useCreatorOnboardingStore((s) => s.activateStudio);
  const displayName = useCreatorOnboardingStore((s) => s.displayName);

  return (
    <OnboardingShell
      title="NEXT Studio"
      subtitle="Your creator workstation — upload, live, analytics in one calm surface."
      routeKey="studio-onboarding"
    >
      <Surface bordered className="space-y-4 p-6">
        <p className="text-sm text-muted">
          {displayName ? `Welcome, ${displayName}.` : 'Activate your studio workspace.'}{' '}
          {studioActivated
            ? 'Studio is ready (demo).'
            : 'One tap to mark activation — full backend connects later.'}
        </p>
        <FieldGroup legend="Studio modules" description="All optional until you need them.">
          <ul className="list-inside list-disc text-sm text-muted">
            <li>Upload & library</li>
            <li>Live control room</li>
            <li>Analytics & revenue</li>
            <li>Community moderation</li>
          </ul>
        </FieldGroup>
        <StepNavigation
          onNext={() => {
            activateStudio();
            trackCreatorActivation('studio_activate', 'studio_onboarding');
          }}
          nextLabel={studioActivated ? 'Studio activated' : 'Activate studio'}
          nextDisabled={studioActivated}
        />
        <Link
          href="/creator-setup"
          className="block text-center text-sm text-accent hover:underline"
        >
          Continue creator setup →
        </Link>
      </Surface>
    </OnboardingShell>
  );
}
