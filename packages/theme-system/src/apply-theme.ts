import { themes, type ThemeName } from '@next/design-system';

const STORAGE_KEY = 'next.theme';

export function getStoredTheme(): ThemeName | 'system' | null {
  if (typeof localStorage === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'dark' || v === 'light' || v === 'system') return v;
  return null;
}

export function storeThemePreference(preference: ThemeName | 'system'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, preference);
}

export function resolveTheme(preference: ThemeName | 'system', systemDark: boolean): ThemeName {
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

/** Apply semantic color CSS variables to the document root. */
export function applyThemeToDocument(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const palette = themes[theme];
  root.dataset['theme'] = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  for (const [role, triplet] of Object.entries(palette)) {
    root.style.setProperty(`--next-color-${role}`, triplet);
  }
}
