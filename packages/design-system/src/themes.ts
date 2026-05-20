// Themes — mapped to CSS variables consumed by the Tailwind preset.
// Each theme is a record from semantic role to `r g b` triplet.

export type ThemeColor =
  | 'bg'
  | 'surface'
  | 'elevated'
  | 'fg'
  | 'muted'
  | 'subtle'
  | 'brand'
  | 'accent'
  | 'danger'
  | 'success'
  | 'ambient'
  | 'glow';

export type Theme = Record<ThemeColor, string>;

export const darkTheme: Theme = {
  bg: '8 8 11',
  surface: '17 17 22',
  elevated: '26 26 33',
  fg: '247 247 250',
  muted: '163 163 177',
  subtle: '108 108 122',
  brand: '255 90 60',
  accent: '120 100 255',
  danger: '255 90 100',
  success: '60 200 140',
  ambient: '40 38 52',
  glow: '90 70 180',
};

export const lightTheme: Theme = {
  bg: '252 252 253',
  surface: '255 255 255',
  elevated: '247 247 250',
  fg: '15 15 20',
  muted: '90 90 105',
  subtle: '140 140 156',
  brand: '230 60 30',
  accent: '90 70 230',
  danger: '220 50 70',
  success: '40 170 120',
  ambient: '235 235 245',
  glow: '120 100 220',
};

export const themes = { dark: darkTheme, light: lightTheme } as const;
export type ThemeName = keyof typeof themes;
