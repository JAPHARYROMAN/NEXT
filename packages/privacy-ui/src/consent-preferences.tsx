'use client';

import { FieldGroup } from '@next/identity-ui';
import type { ConsentPrefs } from './store/privacy-store';

export interface ConsentPreferencesProps {
  readonly consent: ConsentPrefs;
  readonly onChange: (partial: Partial<ConsentPrefs>) => void;
}

export function ConsentPreferences({ consent, onChange }: ConsentPreferencesProps) {
  return (
    <FieldGroup
      legend="Consent preferences"
      description="Plain language — change anytime. No pre-checked dark patterns."
    >
      <div className="space-y-3 text-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consent.personalization}
            onChange={(e) => onChange({ personalization: e.target.checked })}
          />
          <span>
            <span className="font-medium text-fg">Personalization</span>
            <span className="block text-muted">
              Uses watch history to improve discovery — transparent.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consent.analytics}
            onChange={(e) => onChange({ analytics: e.target.checked })}
          />
          <span>
            <span className="font-medium text-fg">Product analytics</span>
            <span className="block text-muted">
              Aggregated usage to improve stability — off by default.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consent.marketing}
            onChange={(e) => onChange({ marketing: e.target.checked })}
          />
          <span>
            <span className="font-medium text-fg">Product updates</span>
            <span className="block text-muted">
              Occasional emails about features you use — never sold.
            </span>
          </span>
        </label>
      </div>
    </FieldGroup>
  );
}
