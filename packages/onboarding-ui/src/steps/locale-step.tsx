'use client';

import { FieldGroup } from '@next/identity-ui';

export interface LocaleStepProps {
  readonly language: string;
  readonly region: string;
  readonly onLanguageChange: (value: string) => void;
  readonly onRegionChange: (value: string) => void;
}

export function LocaleStep({
  language,
  region,
  onLanguageChange,
  onRegionChange,
}: LocaleStepProps) {
  return (
    <FieldGroup
      legend="Language & region"
      description="Optional — improves captions and local discovery."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Language</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-fg"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">Region</span>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-fg"
          >
            <option value="US">United States</option>
            <option value="EU">Europe</option>
            <option value="APAC">Asia-Pacific</option>
            <option value="GLOBAL">Global</option>
          </select>
        </label>
      </div>
    </FieldGroup>
  );
}
