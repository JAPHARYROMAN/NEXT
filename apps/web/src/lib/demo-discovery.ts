import type { ChaosItem } from '@next/discovery-ui';
import type { ConstellationNode, DiscoveryWave, SemanticTopic } from '@next/discovery-ui';

export const demoChaosItems: readonly ChaosItem[] = [
  { id: 'c1', title: 'Signal bleed', creator: '@drift', hue: 130 },
  { id: 'c2', title: 'Unlisted corridor', creator: '@void', hue: 300 },
  { id: 'c3', title: 'Tape loop 7', creator: '@grain', hue: 55 },
];

export const demoConstellation: readonly ConstellationNode[] = [
  { handle: 'lumen', name: 'Lumen', affinity: 0.9 },
  { handle: 'frame', name: 'Frame', affinity: 0.7 },
  { handle: 'haze', name: 'Haze', affinity: 0.5 },
];

export const demoWaves: readonly DiscoveryWave[] = [
  { id: 'wave-1', label: 'First light', description: 'Morning calm and slow reveals' },
  { id: 'wave-2', label: 'Deep field', description: 'Long-form and patience' },
  { id: 'wave-3', label: 'Edge culture', description: 'Underground and experimental' },
];

export const demoSemanticTopics: readonly SemanticTopic[] = [
  { id: 't1', label: 'Urban night', relation: 'near' },
  { id: 't2', label: 'Generative art', relation: 'far' },
  { id: 't3', label: 'Found footage', relation: 'wild' },
];
