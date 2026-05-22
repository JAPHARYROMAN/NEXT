# Analytics Experience

Creator analytics in Phase 9 are **immersive animated shells**, not spreadsheet exports.

## Surfaces

Filter via `useAnalyticsFilterStore`:

- engagement
- audience
- retention
- discovery
- recommendation

## Components

- **`AnimatedChart`** — bar charts with staggered motion and reduced-motion fallback
- **`MetricSparkline`** — headline metric + SVG sparkline
- **`TimelineChart`** — horizontal performance timeline

## Ranges

`7d` | `28d` | `90d` | `365d` — UI state only; ClickHouse-backed data pending contracts.

## Design intent

Optimize for emotional resonance and meaningful discovery signals — not addiction metrics or rage engagement (per NEXT constitution).
