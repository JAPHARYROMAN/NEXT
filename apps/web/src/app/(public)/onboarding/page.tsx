import { UserOnboardingFlow } from '@next/onboarding-ui';

export const metadata = {
  title: 'Onboarding — NEXT',
  description: 'Set up your profile, interests, and discovery preferences.',
};

export default function OnboardingPage() {
  return <UserOnboardingFlow />;
}
