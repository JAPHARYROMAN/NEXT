# Media Evolution

> How "a video" evolves at NEXT — from a linear clip to an adaptive, navigable,
> eventually spatial experience — without ever leaving behind the creator who
> just wants to upload a video and have it work.

## 0. Principle

Every media format NEXT adds is **additive, not replacing**. Short-form does not
die when interactive media arrives; linear video does not die when spatial media
arrives. The media model widens; older formats remain first-class. A creator is
never forced up the complexity ladder.

## 1. Current — linear media

Today's media model (build Phases 7–8): short-form, long-form, livestreams,
clips. The engine is real — resumable upload, content-adaptive transcoding
([ADR 0025](../adr/0025-transcoding-ladder.md)), the processing saga
([ADR 0028](../adr/0028-media-pipeline-orchestrator.md)), signed playback
([ADR 0027](../adr/0027-signed-playback-urls.md)), live streaming. Media is a
linear timeline with renditions.

## 2. Near future (~3 years) — intelligent + assisted media

The linear timeline stays, but it gains a **semantic layer** and **AI-assisted
production**.

- **Semantic video navigation** — every video is deeply indexed (scenes,
  transcript, objects, topics — the media AI subsystems already scaffold this).
  A viewer can jump to "the part about X"; discovery can recommend a _moment_,
  not just a video.
- **AI-assisted creator workflows** — copilots for editing, captioning,
  thumbnails, clip selection, translation. Assistive, disclosed, optional
  ([ai-evolution.md](ai-evolution.md)).
- **Interactive media (early)** — chapters, branches, polls, choice points —
  lightweight interactivity on top of linear video.
- **Adaptive storytelling (early)** — a video that adapts ordering or emphasis
  to context, while remaining a coherent, creator-authored work.

**Architectural implications**: the media model gains a _structure_ layer above
the linear timeline (scenes, chapters, branches, interaction points); semantic
indexing becomes load-bearing, not enrichment; the player gains an interaction
runtime.

**Infrastructure**: far deeper per-video semantic indexing (vector + graph);
copilot inference capacity; an interaction-state service.

**UX**: navigation becomes non-linear; the player surfaces structure.

**Creator**: the upload-and-go path stays trivial; structure and interactivity
are **progressive** — opt-in tooling, never required.

## 3. Long term (~5–10 years) — spatial & adaptive media

Media becomes multi-form. Spatial is **one branch**, not the destination.

- **Immersive / spatial video** — volumetric and 3D-spatial experiences for the
  audiences and hardware that support them ([immersive-computing.md](immersive-computing.md)).
- **Multi-perspective media** — an event captured from many angles; the viewer
  (or an AI director) chooses the perspective.
- **Volumetric experiences** — captured or constructed 3D scenes a viewer moves
  through.
- **Adaptive media realities** — media that recomposes around context,
  accessibility needs, language, and device — while preserving creator intent
  as the invariant.

**Architectural implications**: "a video" becomes "a media object" with
multiple representations (linear, interactive, spatial); the delivery layer must
serve volumetric/spatial formats; the rights and provenance model must span all
representations.

**Infrastructure**: volumetric/spatial media delivery (new codecs, new edge
behavior — [infrastructure-evolution.md](infrastructure-evolution.md)); much
larger storage and bandwidth profiles; spatial compute at the edge.

**UX**: the viewer experience spans a flat screen to a spatial environment, with
graceful fallback between them.

**Creator**: spatial and multi-perspective creation tooling — but the
constitution holds: a creator who only ever uploads a flat 2-minute video is a
full citizen of NEXT in 10 years exactly as today.

## 4. The invariant: creator intent

Through every evolution, **creator intent is the invariant**. Adaptive media
adapts _delivery_ — ordering, language, perspective, accessibility — not
_authorship_. The system never silently rewrites what a creator made. Adaptation
is a transformation with the creator's authored work as its fixed point.

## 5. What becomes obsolete

- **The single-rendition, single-representation video** as the only model —
  superseded by the multi-representation media object.
- **Linear-only navigation** as the only way through a video — superseded by
  semantic navigation.

Nothing about _making a normal video_ becomes obsolete.

## 6. Future ADRs implied

- An interactive-media content/structure model.
- A spatial/volumetric media delivery architecture.
- A media-object representation + rights model spanning all formats.

## Related documents

- [immersive-computing.md](immersive-computing.md) · [ai-evolution.md](ai-evolution.md) · [infrastructure-evolution.md](infrastructure-evolution.md) · [docs/MEDIA_ARCHITECTURE.md](../MEDIA_ARCHITECTURE.md)
