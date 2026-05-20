'use client';

import { FieldGroup } from '@next/identity-ui';
import type { NotificationOnboardingPrefs } from '../store/onboarding-store';

export interface NotificationsStepProps {
  readonly prefs: NotificationOnboardingPrefs;
  readonly onChange: (prefs: Partial<NotificationOnboardingPrefs>) => void;
}

export function NotificationsStep({ prefs, onChange }: NotificationsStepProps) {
  return (
    <FieldGroup
      legend="Notifications"
      description="Calm defaults — no engagement baiting. Adjust anytime."
    >
      <div className="space-y-3 text-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.live}
            onChange={(e) => onChange({ live: e.target.checked })}
          />
          Live events from creators you follow
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.community}
            onChange={(e) => onChange({ community: e.target.checked })}
          />
          Community mentions and rituals
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.digest}
            onChange={(e) => onChange({ digest: e.target.checked })}
          />
          Weekly digest (off by default)
        </label>
      </div>
    </FieldGroup>
  );
}
