/** Depth, ambient light, and spatial scale — Phase 22 immersive foundations. */

export const depthLayers = {
  base: 0,
  content: 10,
  overlay: 20,
  ambient: 30,
  focus: 40,
  chrome: 50,
} as const;

export type DepthLayer = keyof typeof depthLayers;

export const spatialScale = {
  near: 1,
  mid: 0.96,
  far: 0.92,
  ambient: 0.88,
} as const;

export const ambientLight = {
  warm: { hue: 28, saturation: 42, luminance: 0.12 },
  cool: { hue: 220, saturation: 38, luminance: 0.1 },
  neutral: { hue: 0, saturation: 8, luminance: 0.08 },
  cinematic: { hue: 260, saturation: 28, luminance: 0.14 },
} as const;

export type AmbientLightVariant = keyof typeof ambientLight;

export const depthShadows = {
  near: '0 4px 16px rgb(0 0 0 / 0.12)',
  mid: '0 12px 32px rgb(0 0 0 / 0.16)',
  far: '0 24px 48px rgb(0 0 0 / 0.2)',
  ambient: '0 40px 80px rgb(0 0 0 / 0.24)',
} as const;

export const spatialFocusRing = {
  width: 2,
  offset: 4,
  opacity: 0.85,
} as const;
