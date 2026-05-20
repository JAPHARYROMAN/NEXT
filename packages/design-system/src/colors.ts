import { themes, type ThemeColor } from './themes';

export type { ThemeColor };
export { themes, darkTheme, lightTheme } from './themes';
export type { Theme, ThemeName } from './themes';

/** Resolve a semantic color to CSS `rgb(r g b / alpha)` for inline styles. */
export function colorCss(themeName: keyof typeof themes, role: ThemeColor, alpha = 1): string {
  const triplet = themes[themeName][role];
  return `rgb(${triplet.replace(/ /g, ', ')} / ${String(alpha)})`;
}
