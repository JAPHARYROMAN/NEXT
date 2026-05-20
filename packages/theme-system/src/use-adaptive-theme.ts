'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ThemeName } from '@next/design-system';
import {
  applyThemeToDocument,
  getStoredTheme,
  resolveTheme,
  storeThemePreference,
} from './apply-theme';

export type ThemePreference = ThemeName | 'system';

export interface AdaptiveThemeState {
  readonly theme: ThemeName;
  readonly preference: ThemePreference;
  readonly setPreference: (next: ThemePreference) => void;
}

export function useAdaptiveTheme(initial: ThemePreference = 'system'): AdaptiveThemeState {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => getStoredTheme() ?? initial,
  );
  const [theme, setTheme] = useState<ThemeName>('dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      const resolved = resolveTheme(preference, mq.matches);
      setTheme(resolved);
      applyThemeToDocument(resolved);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    storeThemePreference(next);
  }, []);

  return { theme, preference, setPreference };
}
