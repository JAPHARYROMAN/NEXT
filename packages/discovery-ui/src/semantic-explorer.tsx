'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';

export interface SemanticTopic {
  readonly id: string;
  readonly label: string;
  readonly relation: 'near' | 'far' | 'wild';
}

export interface SemanticExplorerProps {
  readonly topics: readonly SemanticTopic[];
  readonly onTopic?: (id: string) => void;
  readonly className?: string;
}

const relationTone: Record<SemanticTopic['relation'], string> = {
  near: 'bg-accent/10 text-accent',
  far: 'bg-surface/60 text-muted',
  wild: 'bg-amber-500/10 text-amber-200',
};

export function SemanticExplorer({ topics, onTopic, className }: SemanticExplorerProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Semantic exploration">
      <h3 className="font-display text-lg font-medium">Explore by meaning</h3>
      <ul className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              className={clsx(
                'rounded-full px-3 py-1.5 text-sm transition-opacity hover:opacity-90',
                relationTone[topic.relation],
              )}
              onClick={() => onTopic?.(topic.id)}
            >
              {topic.label}
            </button>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
