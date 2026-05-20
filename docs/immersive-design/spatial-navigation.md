# Spatial Navigation

`@next/spatial-ui` provides depth-aware navigation without requiring an AR/VR runtime.

## Primitives

| Component      | Role                     |
| -------------- | ------------------------ |
| `SpatialShell` | Root spatial context     |
| `DepthNav`     | Layer-indexed navigation |
| `LayeredNav`   | Tab-like spatial layers  |
| `SpatialPanel` | Depth-transition panel   |
| `FocusFlow`    | Focus-driven step flow   |

## Integration

- `SpatialNavBridge` in `@next/navigation-ui` bridges classic nav with depth nav
- Web route: `/spatial`
- Demo app: `apps/immersive` (port 3011)

## Future displays

Depth values and focus regions are data-driven so AR/VR shells can swap presentation later without changing store contracts.

Cross-reference: [../spatial-computing/future-spatial-foundations.md](../spatial-computing/future-spatial-foundations.md).
