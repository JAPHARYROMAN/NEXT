'use client';

import { FieldGroup, OnboardingShell } from '@next/identity-ui';
import { Surface, Button } from '@next/ui';
import { DiscoveryModePicker } from './discovery-mode-picker';
import { usePreferencesStore, type PersonalizationLevel } from './store/preferences-store';

export function PersonalizationControls() {
  const feedPersonalization = usePreferencesStore((s) => s.feedPersonalization);
  const discoveryRandomness = usePreferencesStore((s) => s.discoveryRandomness);
  const language = usePreferencesStore((s) => s.language);
  const creatorDiscovery = usePreferencesStore((s) => s.creatorDiscovery);
  const communityDiscovery = usePreferencesStore((s) => s.communityDiscovery);
  const sensitiveContentFilter = usePreferencesStore((s) => s.sensitiveContentFilter);
  const personalizationLevel = usePreferencesStore((s) => s.personalizationLevel);
  const setFeedPersonalization = usePreferencesStore((s) => s.setFeedPersonalization);
  const setDiscoveryRandomness = usePreferencesStore((s) => s.setDiscoveryRandomness);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const setCreatorDiscovery = usePreferencesStore((s) => s.setCreatorDiscovery);
  const setCommunityDiscovery = usePreferencesStore((s) => s.setCommunityDiscovery);
  const setSensitiveContentFilter = usePreferencesStore((s) => s.setSensitiveContentFilter);
  const setPersonalizationLevel = usePreferencesStore((s) => s.setPersonalizationLevel);
  const resetRecommendations = usePreferencesStore((s) => s.resetRecommendations);

  return (
    <OnboardingShell
      title="Personalization"
      subtitle="You are in control — we explain what each control does."
    >
      <Surface bordered className="space-y-8 p-5">
        <FieldGroup legend="Feed personalization level">
          <LevelPicker value={personalizationLevel} onChange={setPersonalizationLevel} />
          <input
            type="range"
            min={0}
            max={100}
            value={feedPersonalization}
            onChange={(e) => setFeedPersonalization(Number(e.target.value))}
            className="mt-3 w-full accent-accent"
            aria-label="Feed personalization amount"
          />
        </FieldGroup>

        <DiscoveryModePicker randomness={discoveryRandomness} onChange={setDiscoveryRandomness} />

        <FieldGroup legend="Language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </FieldGroup>

        <FieldGroup legend="Discovery surfaces">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={creatorDiscovery}
              onChange={(e) => setCreatorDiscovery(e.target.checked)}
            />
            Suggest new creators
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={communityDiscovery}
              onChange={(e) => setCommunityDiscovery(e.target.checked)}
            />
            Suggest communities
          </label>
        </FieldGroup>

        <FieldGroup
          legend="Sensitive content"
          description="Placeholder filter — policy UI connects later."
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sensitiveContentFilter}
              onChange={(e) => setSensitiveContentFilter(e.target.checked)}
            />
            Blur sensitive previews in feeds
          </label>
        </FieldGroup>

        <div className="border-t border-subtle/15 pt-4">
          <Button variant="ghost" onClick={resetRecommendations}>
            Reset recommendation profile (placeholder)
          </Button>
          <p className="mt-2 text-xs text-muted">
            Clears local tuning only — no account data deleted.
          </p>
        </div>
      </Surface>
    </OnboardingShell>
  );
}

function LevelPicker({
  value,
  onChange,
}: {
  readonly value: PersonalizationLevel;
  readonly onChange: (v: PersonalizationLevel) => void;
}) {
  const levels: PersonalizationLevel[] = ['minimal', 'balanced', 'rich'];
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Personalization level">
      {levels.map((l) => (
        <label key={l} className="text-sm capitalize">
          <input
            type="radio"
            name="level"
            checked={value === l}
            onChange={() => onChange(l)}
            className="mr-1"
          />
          {l}
        </label>
      ))}
    </div>
  );
}
