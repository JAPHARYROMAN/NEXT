# Theme system

`@next/theme-system` coordinates **system preference**, **explicit light/dark**, and **document-level CSS variables**.

## API

- `useAdaptiveTheme()` — returns resolved `theme`, current `preference` (`'system' | 'dark' | 'light'`), and `setPreference`.
- `applyThemeToDocument(theme)` — writes `data-theme`, toggles `dark` / `light` classes on `<html>`, and mirrors semantic RGB triplets into inline CSS variables (useful when hydrating from storage).
- `storeThemePreference` / `getStoredTheme` — persist user choice (`system` allowed).

## Integration

`@next/ui` `ThemeProvider` wraps `useAdaptiveTheme` so all apps share the same behavior. Design tokens in `@next/design-system/tokens.css` provide the default palette; runtime updates override variables without remounting React trees.

## Dark mode

Dark is the cinematic default for creator tools; consumer web defaults to **system** preference to respect ambient lighting and battery conditions.
