'use client';

import clsx from 'clsx';
import { CreatorCard } from '@next/ui';

export interface ConstellationNode {
  readonly handle: string;
  readonly name: string;
  readonly affinity: number;
}

export interface CreatorConstellationProps {
  readonly nodes: readonly ConstellationNode[];
  readonly className?: string;
}

export function CreatorConstellation({ nodes, className }: CreatorConstellationProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label="Creator constellation">
      <h3 className="font-display text-lg font-medium">Adjacent creators</h3>
      <div className="flex flex-wrap gap-3">
        {nodes.map((node) => (
          <div
            key={node.handle}
            className="relative"
            style={{ opacity: 0.5 + node.affinity * 0.5 }}
          >
            <CreatorCard
              handle={node.handle}
              displayName={node.name}
              href={`/creator/${node.handle}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
