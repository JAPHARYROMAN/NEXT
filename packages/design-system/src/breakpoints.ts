/** Responsive breakpoints — mobile-first, aligned with layout-engine. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  /** 10-foot UI — couch viewing distance, TV browsers */
  tv: 1280,
  ultrawide: 1920,
  /** Projector / 4K living room */
  projector: 2560,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const containerWidths = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
  '2xl': 1400,
  tv: 1440,
  ultrawide: 1680,
  projector: 1920,
} as const;
