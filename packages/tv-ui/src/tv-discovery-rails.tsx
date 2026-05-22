'use client';

import clsx from 'clsx';
import {
  CreatorConstellation,
  DiscoveryWaves,
  SemanticExplorer,
  type ConstellationNode,
  type DiscoveryWave,
  type SemanticTopic,
} from '@next/discovery-ui';
import { trackDiscoveryEngagement } from '@next/frontend-utils';

export interface TvDiscoveryRailsProps {
  readonly waves: readonly DiscoveryWave[];
  readonly topics: readonly SemanticTopic[];
  readonly creators: readonly ConstellationNode[];
  readonly className?: string;
}

export function TvDiscoveryRails({ waves, topics, creators, className }: TvDiscoveryRailsProps) {
  return (
    <section
      className={clsx('space-y-12', className)}
      aria-label="TV discovery"
      onFocus={() => trackDiscoveryEngagement('tv', 'focus_rails')}
    >
      <DiscoveryWaves waves={waves} />
      <SemanticExplorer topics={topics} />
      <CreatorConstellation nodes={creators} />
    </section>
  );
}
