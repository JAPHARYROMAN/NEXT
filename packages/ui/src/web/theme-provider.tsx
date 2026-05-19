'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ThemeName } from '@next/design-system';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (next: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly initial?: ThemeName;
  readonly children: ReactNode;
}

export function ThemeProvider({ initial = 'dark', children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeName>(initial);

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme called outside ThemeProvider');
  return ctx;
}
