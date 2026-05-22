'use client';

import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { trackInteraction } from '@next/frontend-utils';

export interface TimelineScrubberProps {
  readonly durationSec: number;
  readonly label?: string;
  readonly className?: string;
}

export function TimelineScrubber({
  durationSec,
  label = 'Timeline',
  className,
}: TimelineScrubberProps) {
  const [position, setPosition] = useState(0);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      setPosition(next);
      trackInteraction('scrub', 'timeline', Math.round((next / durationSec) * 1000));
    },
    [durationSec],
  );

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums">
          {formatTime(position)} / {formatTime(durationSec)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={durationSec}
        value={position}
        onChange={onChange}
        className="h-2 w-full cursor-pointer accent-accent"
        aria-label={`${label} scrubber`}
        aria-valuemin={0}
        aria-valuemax={durationSec}
        aria-valuenow={position}
      />
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
