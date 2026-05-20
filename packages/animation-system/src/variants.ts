import type { Transition, Variants } from 'framer-motion';
import { durations, easings } from '@next/design-system';

const cinematicEase = easings.cinematic as unknown as [number, number, number, number];

export const pageTransition: Transition = {
  duration: durations.smooth / 1000,
  ease: cinematicEase,
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const feedItemVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
};

export const drawerVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

export function motionSafe<T extends Variants>(variants: T, reduced: boolean): T {
  if (reduced) {
    return {
      initial: {},
      animate: {},
      exit: {},
    } as unknown as T;
  }
  return variants;
}
