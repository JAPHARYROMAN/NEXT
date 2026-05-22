import type { Transition, Variants } from 'framer-motion';
import { durations, easings } from '@next/design-system';

const cinematicEase = easings.cinematic as unknown as [number, number, number, number];

export const depthTransition: Transition = {
  duration: durations.cinematic / 1000,
  ease: cinematicEase,
};

/** Subtle Z-depth enter — spatial panels, not hologram gimmicks */
export const depthEnterVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.99 },
};

/** Environmental background drift */
export const ambientDriftVariants: Variants = {
  initial: { opacity: 0.35 },
  animate: { opacity: 0.55 },
};

/** Layered parallax — translate only, GPU-friendly */
export const parallaxLayerVariants: Variants = {
  near: { y: 0 },
  mid: { y: -8 },
  far: { y: -16 },
};

/** Focus-driven UI emergence */
export const focusEmergeVariants: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/** Audio-reactive placeholder pulse (CSS-driven, no backend) */
export const audioPulseVariants: Variants = {
  idle: { scale: 1, opacity: 0.4 },
  pulse: { scale: 1.02, opacity: 0.55 },
};
