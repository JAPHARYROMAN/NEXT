import { track } from '@next/frontend-utils';

export function trackOnboardingStep(
  step: string,
  properties?: Record<string, string | number | boolean>,
): void {
  track({ name: 'onboarding_step', properties: { step, ...properties } });
}

export function trackOnboardingDropoff(step: string, reason?: string): void {
  track({
    name: 'onboarding_dropoff',
    properties: { step, ...(reason ? { reason } : {}) },
  });
}

export function trackPreferenceSelection(key: string, value: string): void {
  track({ name: 'onboarding_preference', properties: { key, value } });
}

export function trackCreatorActivation(action: string, step: string): void {
  track({ name: 'creator_activation', properties: { action, step } });
}

export function trackPrivacyInteraction(surface: string, action: string): void {
  track({ name: 'privacy_interaction', properties: { surface, action } });
}

export function trackFirstFeedEntry(source: string): void {
  track({ name: 'first_feed_entry', properties: { source } });
}
