'use client';

import { useState } from 'react';
import { OnboardingShell, FieldGroup, StepNavigation } from '@next/identity-ui';
import { Surface } from '@next/ui';
import { AvatarPlaceholder } from './avatar-placeholder';
import { HandleField } from './handle-field';
import { BioEditor } from './bio-editor';
import { ProfilePreview } from './profile-preview';
import { useProfileDraftStore, type ProfileVisibility } from './store/profile-store';

export function ProfileSetupFlow() {
  const displayName = useProfileDraftStore((s) => s.displayName);
  const handle = useProfileDraftStore((s) => s.handle);
  const bio = useProfileDraftStore((s) => s.bio);
  const visibility = useProfileDraftStore((s) => s.visibility);
  const handleAvailable = useProfileDraftStore((s) => s.handleAvailable);
  const completionPct = useProfileDraftStore((s) => s.completionPct);
  const setDisplayName = useProfileDraftStore((s) => s.setDisplayName);
  const setHandle = useProfileDraftStore((s) => s.setHandle);
  const setBio = useProfileDraftStore((s) => s.setBio);
  const setVisibility = useProfileDraftStore((s) => s.setVisibility);
  const checkHandle = useProfileDraftStore((s) => s.checkHandle);

  const [handleError, setHandleError] = useState<string | undefined>();

  const save = () => {
    if (handle && handleAvailable === false) {
      setHandleError('Choose an available handle or leave blank for now.');
      return;
    }
    setHandleError(undefined);
  };

  return (
    <OnboardingShell
      title="Profile setup"
      subtitle="Public-facing identity — only what you want to share."
      aside={
        <ProfilePreview
          displayName={displayName}
          handle={handle}
          bio={bio}
          visibility={visibility}
        />
      }
    >
      <div
        className="mb-6 h-1 rounded-full bg-subtle/20"
        role="progressbar"
        aria-valuenow={completionPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${completionPct}%` }} />
      </div>

      <Surface bordered className="space-y-6 p-5">
        <AvatarPlaceholder label={displayName || 'You'} onUploadClick={() => {}} />
        <FieldGroup legend="Display name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm"
          />
        </FieldGroup>
        <HandleField
          value={handle}
          available={handleAvailable}
          onChange={setHandle}
          onCheck={checkHandle}
          {...(handleError ? { error: handleError } : {})}
        />
        <BioEditor value={bio} onChange={setBio} />
        <FieldGroup legend="Visibility">
          <VisibilityOptions value={visibility} onChange={setVisibility} />
        </FieldGroup>
      </Surface>

      <StepNavigation onNext={save} nextLabel="Save profile draft" />
    </OnboardingShell>
  );
}

function VisibilityOptions({
  value,
  onChange,
}: {
  readonly value: ProfileVisibility;
  readonly onChange: (v: ProfileVisibility) => void;
}) {
  const options: { id: ProfileVisibility; label: string }[] = [
    { id: 'public', label: 'Public' },
    { id: 'unlisted', label: 'Unlisted' },
    { id: 'private', label: 'Private' },
  ];
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Profile visibility">
      {options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
