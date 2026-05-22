# Community motion bridge

Social motion extends `@next/animation-system` variants for Phase 14.

## Variants

- `presenceVariants` — member chips entering a room
- `reactionVariants` — reaction send feedback
- `roomEntryVariants` — watch party / community room entry

## Usage

Consumed by `@next/community-ui` (`MemberPresence`, `CommunityHeader`) and `@next/social-ui` (`WatchPartyRoom`, `ReactionBar`).

## Reduced motion

All animated surfaces wrap variants with `motionSafe(variants, useReducedMotion())` per design system policy.
