'use client';

import { OnboardingShell } from '@next/identity-ui';
import { Surface } from '@next/ui';
import { track } from '@next/frontend-utils';
import { PrivacyCards, type PrivacyCard } from './privacy-cards';
import { ConsentPreferences } from './consent-preferences';
import { AccountSafetyShell } from './account-safety-shell';
import { usePrivacyStore } from './store/privacy-store';

function trackPrivacy(surface: string, action: string) {
  track({ name: 'privacy_interaction', properties: { surface, action } });
}

export function PrivacyTrustShell() {
  const consent = usePrivacyStore((s) => s.consent);
  const setConsent = usePrivacyStore((s) => s.setConsent);
  const dataExportRequested = usePrivacyStore((s) => s.dataExportRequested);
  const requestDataExport = usePrivacyStore((s) => s.requestDataExport);
  const sessionTrustPlaceholder = usePrivacyStore((s) => s.sessionTrustPlaceholder);
  const personalizationTransparent = usePrivacyStore((s) => s.personalizationTransparent);

  const cards: PrivacyCard[] = [
    {
      id: 'data',
      title: 'Your data',
      description: 'Export or delete — contract-ready placeholders, no backend yet.',
      actionLabel: dataExportRequested ? 'Export queued (demo)' : 'Request export',
      onAction: () => {
        requestDataExport();
        trackPrivacy('data', 'export_request');
      },
    },
    {
      id: 'personalization',
      title: 'Personalization transparency',
      description: personalizationTransparent
        ? 'We show why items appear — ranking explainer connects when intelligence layer is live.'
        : 'Transparency mode off',
      actionLabel: 'Learn how feeds work',
      onAction: () => trackPrivacy('personalization', 'learn_more'),
    },
    {
      id: 'history',
      title: 'Watch history',
      description: 'Pause or clear history used for recommendations — local demo only.',
      actionLabel: 'Manage history (placeholder)',
      onAction: () => trackPrivacy('history', 'manage'),
    },
    {
      id: 'ads',
      title: 'Advertising',
      description: 'NEXT does not sell personal data. Sponsorships are creator-led and labeled.',
    },
  ];

  return (
    <OnboardingShell title="Privacy & trust" subtitle="Calm controls — not a legal maze.">
      <div className="space-y-8">
        <PrivacyCards cards={cards} />
        <Surface bordered className="p-5">
          <ConsentPreferences consent={consent} onChange={setConsent} />
        </Surface>
        <AccountSafetyShell sessionSummary={sessionTrustPlaceholder} />
      </div>
    </OnboardingShell>
  );
}

/** Account setup uses the same trust surfaces with a dedicated page title. */
export function AccountSetupShell() {
  const consent = usePrivacyStore((s) => s.consent);
  const setConsent = usePrivacyStore((s) => s.setConsent);
  const dataExportRequested = usePrivacyStore((s) => s.dataExportRequested);
  const requestDataExport = usePrivacyStore((s) => s.requestDataExport);
  const sessionTrustPlaceholder = usePrivacyStore((s) => s.sessionTrustPlaceholder);
  const personalizationTransparent = usePrivacyStore((s) => s.personalizationTransparent);

  const cards: PrivacyCard[] = [
    {
      id: 'data',
      title: 'Your data',
      description: 'Export or delete — contract-ready placeholders, no backend yet.',
      actionLabel: dataExportRequested ? 'Export queued (demo)' : 'Request export',
      onAction: () => {
        requestDataExport();
        trackPrivacy('account_setup', 'export_request');
      },
    },
    {
      id: 'personalization',
      title: 'Personalization transparency',
      description: personalizationTransparent
        ? 'We show why items appear — ranking explainer connects when intelligence layer is live.'
        : 'Transparency mode off',
      actionLabel: 'Learn how feeds work',
      onAction: () => trackPrivacy('account_setup', 'learn_more'),
    },
    {
      id: 'history',
      title: 'Watch history',
      description: 'Pause or clear history used for recommendations — local demo only.',
      actionLabel: 'Manage history (placeholder)',
      onAction: () => trackPrivacy('account_setup', 'history'),
    },
    {
      id: 'ads',
      title: 'Advertising',
      description: 'NEXT does not sell personal data. Sponsorships are creator-led and labeled.',
    },
  ];

  return (
    <OnboardingShell title="Account setup" subtitle="Trust, consent, and safety in one place.">
      <div className="space-y-8">
        <PrivacyCards cards={cards} />
        <Surface bordered className="p-5">
          <ConsentPreferences consent={consent} onChange={setConsent} />
        </Surface>
        <AccountSafetyShell sessionSummary={sessionTrustPlaceholder} />
      </div>
    </OnboardingShell>
  );
}
