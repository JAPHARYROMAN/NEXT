'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeName } from '@next/design-system';
import { useAdaptiveTheme, type ThemePreference } from '@next/theme-system';

interface ThemeContextValue {
  theme: ThemeName;
  preference: ThemePreference;
  setTheme: (next: ThemeName) => void;
  setPreference: (next: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly initial?: ThemePreference;
  readonly children: ReactNode;
}

export function ThemeProvider({ initial = 'system', children }: ThemeProviderProps) {
  const { theme, preference, setPreference } = useAdaptiveTheme(initial);

  const setTheme = (next: ThemeName) => setPreference(next);

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme called outside ThemeProvider');
  return ctx;
}
