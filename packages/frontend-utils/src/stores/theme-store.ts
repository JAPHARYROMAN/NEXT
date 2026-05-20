import { create } from 'zustand';
import type { ThemeName } from '@next/design-system';

export type ThemePreference = ThemeName | 'system';

interface ThemeState {
  readonly preference: ThemePreference;
  readonly setPreference: (p: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));
