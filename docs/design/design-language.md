# NEXT design language

NEXT is a **human-centered media ecosystem**: calm surfaces, cinematic depth, and emotionally intelligent hierarchy. The visual system rejects generic SaaS density, engagement bait, and algorithmic anxiety.

## Principles

- **Cinematic restraint**: generous space, soft elevation, long-form typography. Motion supports comprehension; it never competes for attention.
- **Semantic color**: roles (`bg`, `surface`, `fg`, `brand`) map to CSS variables so themes adapt without rewiring components.
- **Precision + chaos**: layouts support structured feeds while leaving room for unexpected discovery modules (never framed as urgency).
- **Accessibility as craft**: visible focus, keyboard parity, screen reader labels on icon-only controls, and `prefers-reduced-motion` honored across motion layers.

## Typography

Display and body scales live in `@next/design-system` tokens and Tailwind extensions (`font-display`, `text-display`). Prefer **Inter** / system stacks until a bespoke family ships.

## Surfaces

Use `@next/ui` `Surface` for cards and panels. Elevation tokens (`elevation1`–`cinematic`) communicate depth without harsh borders.

## References

- `packages/design-system/src/tokens.ts`
- `packages/design-system/src/themes.ts`
- `packages/design-system/src/tokens.css`
