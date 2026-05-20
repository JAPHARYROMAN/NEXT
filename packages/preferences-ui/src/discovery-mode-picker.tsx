'use client';

import clsx from 'clsx';
import { FieldGroup } from '@next/identity-ui';

export interface DiscoveryModePickerProps {
  readonly randomness: number;
  readonly onChange: (value: number) => void;
}

export function DiscoveryModePicker({ randomness, onChange }: DiscoveryModePickerProps) {
  return (
    <FieldGroup
      legend="Discovery randomness"
      description="Higher values introduce more serendipity — never rage-bait or addiction loops."
    >
      <input
        type="range"
        min={0}
        max={100}
        value={randomness}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
        aria-valuetext={`${randomness}% randomness`}
      />
      <p className={clsx('text-xs text-muted')}>
        {randomness}% — transparent slider, no hidden tuning
      </p>
    </FieldGroup>
  );
}
