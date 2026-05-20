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

export const panelVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const scrollRevealVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export const playerVariants: Variants = {
  mini: { opacity: 1, y: 0, scale: 1 },
  theater: { opacity: 1, y: 0, scale: 1 },
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.99 },
};

export const overlayVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
};

/** Warm presence pulse for social rooms */
export const presenceVariants: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
};

/** Reaction send feedback */
export const reactionVariants: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

/** Watch party / community room entry */
export const roomEntryVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const fullscreenVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Search bar focus reveal */
export const searchBarVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/** Staggered search result entry */
export const searchResultVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

/** Discovery shelf / wave reveal */
export const discoveryRevealVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/** Chaos mode drift — subtle, not disorienting */
export const chaosDriftVariants: Variants = {
  initial: { opacity: 0, rotate: -1, scale: 0.98 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
};

/** Constellation node pulse */
export const constellationVariants: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
};

/** TV shelf — slow cinematic reveal */
export const tvShelfVariants: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
};

/** Theater ambient background drift */
export const theaterAmbientVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.65 },
};

/** Remote focus ring — calm pulse, high visibility */
export const focusRingVariants: Variants = {
  idle: { scale: 1 },
  focused: { scale: 1.02 },
};

/** Spatial depth panel emergence — Phase 22 */
export const spatialPanelVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.99 },
};

/** Ambient environmental drift — subtle */
export const environmentalDriftVariants: Variants = {
  initial: { opacity: 0.3 },
  animate: { opacity: 0.5 },
};

/** Immersive focus chrome */
export const immersiveChromeVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
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
