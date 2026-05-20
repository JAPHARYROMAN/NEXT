'use client';

import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import { trackPlaybackResponsiveness, useGestureStore } from '@next/frontend-utils';

export interface TouchScrubberProps {
  readonly value: number;
  readonly max: number;
  readonly onChange: (value: number) => void;
  readonly playing?: boolean;
  readonly className?: string;
}

export function TouchScrubber({ value, max, onChange, playing, className }: TouchScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setActive = useGestureStore((s) => s.setActive);

  const scrubFromTouch = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const start = performance.now();
      onChange(Math.round(ratio * max));
      trackPlaybackResponsiveness('scrub', Math.round(performance.now() - start));
    },
    [max, onChange],
  );

  return (
    <div className={clsx('space-y-2', className)} aria-label="Playback progress">
      <div
        ref={trackRef}
        className="relative h-10 touch-none"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Seek"
        onTouchStart={(e) => {
          setActive('scrub');
          const t = e.touches[0];
          if (t) scrubFromTouch(t.clientX);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          if (t) scrubFromTouch(t.clientX);
        }}
        onTouchEnd={() => setActive('none')}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20" />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
          style={{ width: `${(value / max) * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `calc(${(value / max) * 100}% - 8px)` }}
        />
      </div>
      <p className="text-xs text-white/70">{playing ? 'Playing' : 'Paused'}</p>
    </div>
  );
}
