import { breakpoints, containerWidths } from '@next/design-system';

export { breakpoints, containerWidths };
export type { Breakpoint } from '@next/design-system';

export function minWidth(bp: keyof typeof breakpoints): string {
  return `(min-width: ${breakpoints[bp]}px)`;
}
