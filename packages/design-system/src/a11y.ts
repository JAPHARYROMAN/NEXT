/** Accessibility primitives — focus rings, skip links, live regions. */

export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

export const srOnly = 'sr-only';

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(reducedMotionQuery).matches;
}
