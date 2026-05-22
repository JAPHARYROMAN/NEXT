export const demoSpatialNav = [
  { id: 'discover', label: 'Discovery room', depth: 0 },
  { id: 'watch', label: 'Watch environment', depth: 1 },
  { id: 'social', label: 'Ambient social', depth: 2 },
] as const;

export const demoAmbientMedia = {
  id: 'aurora-session',
  title: 'Aurora — Living Media Surface',
  creator: 'Studio North',
  mood: 'calm' as const,
};

export const demoDiscoveryRails = [
  { id: '1', title: 'Underground cinema', tag: 'Expansion' },
  { id: '2', title: 'Calm intelligence', tag: 'Precision' },
  { id: '3', title: 'Unexpected orbit', tag: 'Chaos' },
];
