'use client';

import { FieldGroup } from '@next/identity-ui';
import { Surface } from '@next/ui';

export interface ProfileStepProps {
  readonly displayName: string;
  readonly onDisplayNameChange: (value: string) => void;
  readonly error?: string | undefined;
}

export function ProfileStep({ displayName, onDisplayNameChange, error }: ProfileStepProps) {
  return (
    <Surface bordered className="space-y-4 p-5">
      <FieldGroup
        legend="Display name"
        description="How you appear in comments and communities. Not required to be your legal name."
        {...(error ? { error } : {})}
      >
        <input
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className="w-full rounded-lg border border-subtle/20 bg-bg px-3 py-2 text-sm text-fg"
          placeholder="Your name"
          aria-invalid={Boolean(error)}
          autoComplete="nickname"
        />
      </FieldGroup>
      <p className="text-xs text-muted">
        Handle and avatar can be set on the profile setup screen — skip anything you are not ready
        for.
      </p>
    </Surface>
  );
}
