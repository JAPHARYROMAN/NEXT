import { gradientCss, type CinematicGradient } from './cinematic-gradients';

/** Apply subtle ambient lighting data attributes for GPU-friendly overlays. */
export function applyAmbientLighting(element: HTMLElement, variant: CinematicGradient): void {
  element.dataset['ambient'] = variant;
  element.style.setProperty('--next-ambient-gradient', gradientCss(variant));
}

export function clearAmbientLighting(element: HTMLElement): void {
  delete element.dataset['ambient'];
  element.style.removeProperty('--next-ambient-gradient');
}
