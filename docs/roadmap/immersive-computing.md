# Immersive Computing

> A deliberately grounded roadmap for AR, VR, and spatial computing — designed
> to be ready for immersive media without betting the platform on a future that
> may arrive late, or differently than expected.

## 0. Principle

Immersive computing is **roadmap Phase E** — and the most heavily _gated_ phase
in the entire roadmap. The governing rule, drawn straight from
[anti-patterns.md](anti-patterns.md) AP-7: NEXT does not lead with immersive,
does not force a "metaverse", and does not invest ahead of evidence. Immersive
is an **expansion NEXT is ready for**, not a migration it commits to.

Three honest premises:

1. Immersive hardware adoption is **uncertain in timing and shape**. The
   roadmap must not assume it.
2. Most NEXT usage will be flat-screen (phone, desktop, TV) for the foreseeable
   future, and possibly forever. Flat-screen is not "legacy".
3. Immersive earns its place by being _genuinely better_ for specific
   experiences — not by being new.

## 1. Current — flat-screen, with one immersive seed

Today NEXT is flat-screen. There is a single immersive seed: the `immersive` app
(WebXR) exists as an experimental surface. It is a probe, not a commitment.

## 2. Readiness layer (~3 years) — be prepared, don't pivot

In the near term NEXT does **not** build immersive media. It builds _optionality_:

- **Spatial-ready media model** — the media-object model
  ([media-evolution.md](media-evolution.md)) is designed so a spatial
  representation _could_ be added later without a rewrite. This is cheap
  foresight, not immersive investment.
- **WebXR experimentation** — the `immersive` app continues as a low-cost probe
  for learning, not a product line.
- **Adoption monitoring** — NEXT tracks real immersive-hardware adoption signals.
  These signals — not internal enthusiasm — gate Phase E.

The near-term immersive budget is deliberately small. The point is to be _ready_,
not _early_.

## 3. Phase-E trigger (~5–8 years) — gated entry

NEXT begins serious immersive media work **only when gating signals are met**:

- a real, sizable installed base of capable immersive hardware;
- evidence that NEXT creators _want_ to make immersive media and audiences want
  to watch it;
- immersive creation tooling that is genuinely usable by ordinary creators.

If those signals do not arrive, Phase E **does not start** — and that is a
success of the roadmap, not a failure. The roadmap explicitly permits Phase E to
slip indefinitely.

## 4. When it does arrive — what NEXT builds

If and when the gate opens:

- **Immersive video & spatial media** — volumetric and 3D-spatial experiences as
  a media representation alongside linear and interactive
  ([media-evolution.md](media-evolution.md)).
- **Immersive creator spaces** — spaces creators build and own
  ([creator-economy-evolution.md](creator-economy-evolution.md)).
- **Immersive gatherings** — spatial community co-presence
  ([community-evolution.md](community-evolution.md)).
- **Ambient & spatial interfaces** — lightweight spatial overlays and ambient
  computing surfaces, which may matter _sooner and more_ than full VR.

Every immersive feature is **additive with graceful flat-screen fallback**: an
immersive experience always has a coherent flat-screen form. No creator is
forced to make immersive media; no viewer is forced to own a headset.

## 5. What NEXT explicitly will not do

- **Will not** force a metaverse narrative or migrate the platform's identity to
  immersive.
- **Will not** make immersive the privileged or default modality.
- **Will not** invest heavily ahead of the adoption gate (§3).
- **Will not** ship gimmick immersive features that are worse than their
  flat-screen equivalent.
- **Will not** treat flat-screen as deprecated — ever.

## 6. The realistic bet

The grounded view: **ambient and lightweight spatial interfaces** (glanceable
overlays, spatial audio, AR annotations) are more likely to matter, sooner and
more broadly, than full-immersion VR. The roadmap weights its readiness work
accordingly — flexible enough for full immersion if it arrives, but not betting
the platform on it. NEXT's identity is _a discovery engine for human culture_;
that is true on a phone screen, and it would be true in a headset. The screen is
not the thesis.

## 7. Future ADRs implied

- A spatial/volumetric media representation + delivery architecture (Phase-E
  gated).
- An immersive-space ownership and moderation model (Phase-E gated).

## Related documents

- [media-evolution.md](media-evolution.md) · [community-evolution.md](community-evolution.md) · [infrastructure-evolution.md](infrastructure-evolution.md) · [anti-patterns.md](anti-patterns.md) (AP-7)
