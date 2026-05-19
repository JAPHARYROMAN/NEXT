# @next/immersive — NEXT World

Spatial / 3D / WebXR experiences. Hosts NEXT World and 3D embeds across the platform.

## Architecture
- **Framework**: Next.js + Three.js via React Three Fiber. WebXR session for VR/AR-capable browsers (Quest, Vision Pro).
- **Rendering**: client-only entry (`use client` at the canvas root); ISR for the scene index pages.
- **Assets**: GLB/GLTF served from CloudFront with Draco compression; KTX2 textures.
- **State**: per-scene Zustand stores; cross-scene state (user, inventory) via shared GraphQL.
- **Performance**: budget 60fps on Quest 3 baseline; LOD enforced; instanced rendering for crowds.

## Run

```bash
pnpm --filter @next/immersive dev
```

Open <http://localhost:3030>. Use a WebXR-capable browser for headset preview.
