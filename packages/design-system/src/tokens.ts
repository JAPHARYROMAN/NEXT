// Design tokens — the single source of truth for NEXT's visual language.
// Values are intentionally semantic (bg, surface, brand) not literal (gray-100).

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  cinematic: 32,
} as const;

export const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

export const easings = {
  cinematic: [0.16, 1, 0.3, 1] as const,
  gentle: [0.4, 0, 0.2, 1] as const,
  swift: [0.55, 0, 0.1, 1] as const,
};

export const durations = {
  instant: 120,
  quick: 180,
  smooth: 320,
  cinematic: 520,
} as const;

export const elevation = {
  none: 'none',
  e1: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
  e2: '0 4px 8px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.04)',
  e3: '0 12px 24px rgb(0 0 0 / 0.08), 0 4px 8px rgb(0 0 0 / 0.04)',
  cinematic: '0 30px 60px rgb(0 0 0 / 0.12), 0 12px 24px rgb(0 0 0 / 0.06)',
} as const;

export const typography = {
  scale: {
    display: { size: 72, lineHeight: 1.05, weight: 700, tracking: -0.03 },
    h1: { size: 48, lineHeight: 1.1, weight: 700, tracking: -0.02 },
    h2: { size: 32, lineHeight: 1.15, weight: 600, tracking: -0.015 },
    h3: { size: 24, lineHeight: 1.2, weight: 600, tracking: -0.01 },
    body: { size: 16, lineHeight: 1.55, weight: 400, tracking: 0 },
    small: { size: 14, lineHeight: 1.5, weight: 400, tracking: 0 },
    caption: { size: 12, lineHeight: 1.4, weight: 500, tracking: 0.01 },
  },
} as const;
