import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { DiscoveryStep } from './steps/discovery-step';
import { ProfileStep } from './steps/profile-step';
import { useOnboardingStore } from './store/onboarding-store';

describe('onboarding-ui', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('renders discovery mode radiogroup', () => {
    render(
      <DiscoveryStep
        mode="balanced"
        chaosOptIn={false}
        onModeChange={() => {}}
        onChaosOptIn={() => {}}
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Discovery mode' })).toBeTruthy();
    expect(screen.getByText('Balanced')).toBeTruthy();
  });

  it('validates profile display name in store flow', () => {
    render(<ProfileStep displayName="" onDisplayNameChange={() => {}} error="Too short" />);
    expect(screen.getByRole('alert').textContent).toBe('Too short');
  });

  it('persists interest toggle in store', () => {
    useOnboardingStore.getState().toggleInterest('Ambient film');
    expect(useOnboardingStore.getState().interests).toContain('Ambient film');
  });
});
