# Immersive Motion Bridge

Connects Phase 22 `@next/ambient-motion` with existing motion bridges.

| Source             | Consumers                                        |
| ------------------ | ------------------------------------------------ |
| `ambient-motion`   | spatial-ui, immersive-ui, environment-ui         |
| `animation-system` | spatialPanelVariants, environmentalDriftVariants |
| `theme-system`     | EmotionAdaptiveBg gradients                      |

## Reduced motion

All immersive surfaces must call `useAmbientMotion` or `motionSafe` before animating.

## Cross-surface parity

| Bridge                                               | Phase             |
| ---------------------------------------------------- | ----------------- |
| [watch-motion-bridge.md](./watch-motion-bridge.md)   | Watch             |
| [tv-motion-bridge.md](./tv-motion-bridge.md)         | TV / theater      |
| [mobile-motion-bridge.md](./mobile-motion-bridge.md) | Mobile            |
| immersive-motion-bridge.md                           | Spatial / ambient |
