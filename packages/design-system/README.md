# @next/design-system

Design tokens, themes, and CSS variables shared across web, mobile, TV, studio, and immersive.

- Semantic tokens (`bg`, `surface`, `brand`, `accent`) — no literal colors at call sites.
- Dark and light themes mapped to CSS variables.
- Motion easings tuned for cinematic feel (per [SECTION 7](../../AGENTS.md)).

Tokens are consumed by `@next/config/tailwind/base` and by mobile via the [`react-native-unistyles`](https://github.com/jpudysz/react-native-unistyles) adapter in [`packages/ui/native`](../ui).
