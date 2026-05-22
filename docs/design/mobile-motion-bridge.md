# Mobile Motion Bridge

Mobile surfaces reuse the ecosystem motion language:

- **Nav** — `fullscreenVariants` for bottom bar hide during immersive playback
- **Feed** — `SwipeFeed` CSS transform with `motion-reduce:transition-none`
- **Panels** — `panelVariants` on `FloatingNavSurface`
- **Player** — `playerVariants` on mini player; reduced motion via `useReducedMotion`

Touch-responsive timing targets &lt; 300ms perceived nav; gesture latency tracked for tuning.
