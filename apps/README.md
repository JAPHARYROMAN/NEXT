# Applications

User-facing surfaces. Each app composes shared packages; product features (Video, Live, Communities, …) are *not* separate apps — they are routes/sections inside the right surface.

| App | Surface | Hosts |
| --- | --- | --- |
| [`web`](web) | Browser | All products |
| [`mobile`](mobile) | iOS + Android | Video, Live, Communities, Studio (lite) |
| [`admin`](admin) | Browser (staff) | Internal ops |
| [`studio`](studio) | Browser (creators) | Creator workstation |
| [`tv`](tv) | TV / large screens | Video, Live, Sports |
| [`immersive`](immersive) | WebXR | NEXT World |

Each app declares its own runtime, rendering, and performance strategy in its README. All apps consume the same federated GraphQL gateway and the same design system, so the experience feels like one platform regardless of surface.
