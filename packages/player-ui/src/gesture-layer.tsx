'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import { trackInteraction } from '@next/frontend-utils';

export interface GestureLayerProps {
  readonly onTap?: () => void;
  readonly onDoubleTap?: () => void;
  readonly className?: string;
}

export function GestureLayer({ onTap, onDoubleTap, className }: GestureLayerProps) {
  const handleClick = useCallback(() => {
    const start = performance.now();
    onTap?.();
    trackInteraction('tap', 'player_surface', Math.round(performance.now() - start));
  }, [onTap]);

  const handleDoubleClick = useCallback(() => {
    onDoubleTap?.();
    trackInteraction('double_tap', 'player_surface', 0);
  }, [onDoubleTap]);

  return (
    <button
      type="button"
      className={clsx('absolute inset-0 z-10 cursor-default bg-transparent', className)}
      aria-label="Player surface — tap to show controls, double-tap to play or pause"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    />
  );
}
