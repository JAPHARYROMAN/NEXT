export const demoSpatialRooms = [
  {
    id: 'discovery',
    title: 'Immersive discovery room',
    description: 'Precision, expansion, and chaos rails in a calm spatial frame.',
    tag: 'Discovery',
  },
  {
    id: 'creator',
    title: 'Creator environment',
    description: 'Ambient social space with living media surfaces.',
    tag: 'Creator',
  },
  {
    id: 'shared',
    title: 'Shared spatial watch',
    description: 'Future-ready shell for co-presence without VR runtime.',
    tag: 'Social',
  },
] as const;

export const demoSpatialNav = [
  { id: 'discover', label: 'Discovery', depth: 0 },
  { id: 'creator', label: 'Creator space', depth: 1 },
  { id: 'shared', label: 'Shared watch', depth: 2 },
] as const;
