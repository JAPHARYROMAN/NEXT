import { durations, easings } from './tokens';

export const motionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.smooth / 1000, ease: easings.cinematic },
  },
  slideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: durations.cinematic / 1000, ease: easings.cinematic },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.99 },
    transition: { duration: durations.smooth / 1000, ease: easings.gentle },
  },
} as const;

export type MotionPreset = keyof typeof motionPresets;
