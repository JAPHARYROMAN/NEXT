'use client';

import clsx from 'clsx';
import { FieldGroup } from '@next/identity-ui';
import { DEMO_INTERESTS } from '../types';

export interface InterestsStepProps {
  readonly selected: readonly string[];
  readonly onToggle: (interest: string) => void;
}

export function InterestsStep({ selected, onToggle }: InterestsStepProps) {
  return (
    <FieldGroup
      legend="What draws you in?"
      description="Pick a few — this shapes your first feed. Change anytime in preferences."
    >
      <ul className="flex flex-wrap gap-2" role="list">
        {DEMO_INTERESTS.map((interest) => {
          const active = selected.includes(interest);
          return (
            <li key={interest}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(interest)}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'border-accent/50 bg-accent/15 text-fg'
                    : 'border-subtle/20 text-muted hover:border-subtle/40',
                )}
              >
                {interest}
              </button>
            </li>
          );
        })}
      </ul>
    </FieldGroup>
  );
}
