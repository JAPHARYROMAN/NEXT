'use client';

import { useEffect } from 'react';
import { trackRemoteLatency } from '@next/frontend-utils';

export interface RemoteShortcutsProps {
  readonly onBack?: () => void;
  readonly onPlayPause?: () => void;
  readonly onHome?: () => void;
}

/** Maps common TV remote keys (browser keyboard stand-ins for dev). */
export function RemoteShortcuts({ onBack, onPlayPause, onHome }: RemoteShortcutsProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const start = performance.now();
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onBack?.();
        trackRemoteLatency('back', Math.round(performance.now() - start));
      }
      if (e.key === ' ' || e.key === 'MediaPlayPause') {
        e.preventDefault();
        onPlayPause?.();
        trackRemoteLatency('play_pause', Math.round(performance.now() - start));
      }
      if (e.key === 'Home' || (e.metaKey && e.key === 'h')) {
        e.preventDefault();
        onHome?.();
        trackRemoteLatency('home', Math.round(performance.now() - start));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, onHome, onPlayPause]);

  return null;
}
