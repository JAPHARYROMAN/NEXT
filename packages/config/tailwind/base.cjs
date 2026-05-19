/** @type {import('tailwindcss').Config} */
// NEXT — base Tailwind preset. Apps extend this with their content globs.
// Tokens here are intentionally minimal; semantic tokens live in @next/design-system.

module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--next-font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--next-font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--next-font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Surfaces consume CSS variables exposed by @next/design-system themes.
        bg: 'rgb(var(--next-color-bg) / <alpha-value>)',
        surface: 'rgb(var(--next-color-surface) / <alpha-value>)',
        elevated: 'rgb(var(--next-color-elevated) / <alpha-value>)',
        fg: 'rgb(var(--next-color-fg) / <alpha-value>)',
        muted: 'rgb(var(--next-color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--next-color-subtle) / <alpha-value>)',
        brand: 'rgb(var(--next-color-brand) / <alpha-value>)',
        accent: 'rgb(var(--next-color-accent) / <alpha-value>)',
        danger: 'rgb(var(--next-color-danger) / <alpha-value>)',
        success: 'rgb(var(--next-color-success) / <alpha-value>)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
        cinematic: '32px',
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
        gentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        instant: '120ms',
        quick: '180ms',
        smooth: '320ms',
        cinematic: '520ms',
      },
      boxShadow: {
        elevation1: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
        elevation2: '0 4px 8px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.04)',
        elevation3: '0 12px 24px rgb(0 0 0 / 0.08), 0 4px 8px rgb(0 0 0 / 0.04)',
        cinematic:
          '0 30px 60px rgb(0 0 0 / 0.12), 0 12px 24px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
