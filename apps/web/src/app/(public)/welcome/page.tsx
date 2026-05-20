import { WelcomeExperience } from '@next/onboarding-ui';

export const metadata = {
  title: 'Welcome — NEXT',
  description: 'Calm first entry into the NEXT ecosystem.',
};

export default function WelcomePage() {
  return <WelcomeExperience />;
}
