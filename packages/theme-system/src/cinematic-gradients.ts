/** Named cinematic gradient tokens for creator surfaces. */
export const cinematicGradients = {
  aurora:
    'linear-gradient(135deg, rgb(var(--next-color-accent) / 0.14), rgb(var(--next-color-surface)))',
  ember: 'linear-gradient(160deg, rgb(180 80 40 / 0.18), rgb(var(--next-color-bg)))',
  depth:
    'linear-gradient(180deg, rgb(var(--next-color-elevated) / 0.55), rgb(var(--next-color-bg)))',
  studio:
    'linear-gradient(120deg, rgb(var(--next-color-accent) / 0.1) 0%, rgb(var(--next-color-surface)) 55%, rgb(var(--next-color-bg)))',
} as const;

export type CinematicGradient = keyof typeof cinematicGradients;

export function gradientCss(name: CinematicGradient): string {
  return cinematicGradients[name];
}
