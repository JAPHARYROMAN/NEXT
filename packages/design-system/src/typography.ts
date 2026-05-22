import { typography } from './tokens';

/** Tailwind-friendly class maps derived from the type scale. */
export const typeClasses = {
  display: 'font-display text-display tracking-tight',
  h1: 'font-display text-4xl font-bold tracking-tight md:text-5xl',
  h2: 'font-display text-2xl font-semibold tracking-tight md:text-3xl',
  h3: 'text-xl font-semibold tracking-tight',
  body: 'text-base leading-relaxed',
  small: 'text-sm leading-normal',
  caption: 'text-xs font-medium tracking-wide text-muted',
} as const;

export type TypeScale = keyof typeof typography.scale;

export function typeStyle(scale: TypeScale): {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
} {
  const t = typography.scale[scale];
  return {
    fontSize: t.size,
    lineHeight: t.lineHeight,
    fontWeight: t.weight,
    letterSpacing: t.tracking,
  };
}
