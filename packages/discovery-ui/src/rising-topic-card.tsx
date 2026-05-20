'use client';

import clsx from 'clsx';
import { Badge } from '@next/ui';

export interface RisingTopic {
  readonly id: string;
  readonly label: string;
  readonly context: string;
  readonly sentiment?: 'curious' | 'warm' | 'experimental';
}

export interface RisingTopicCardProps {
  readonly topic: RisingTopic;
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

const sentimentTone: Record<NonNullable<RisingTopic['sentiment']>, string> = {
  curious: 'bg-accent/10 text-accent',
  warm: 'bg-rose-500/10 text-rose-200',
  experimental: 'bg-amber-500/10 text-amber-200',
};

export function RisingTopicCard({ topic, onSelect, className }: RisingTopicCardProps) {
  return (
    <button
      type="button"
      className={clsx(
        'rounded-xl border border-subtle/15 p-4 text-left transition-colors hover:border-subtle/30',
        className,
      )}
      onClick={() => onSelect?.(topic.id)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{topic.label}</span>
        <Badge tone="accent">Rising</Badge>
      </div>
      <p className="mt-2 text-sm text-muted">{topic.context}</p>
      {topic.sentiment ? (
        <span
          className={clsx(
            'mt-3 inline-block rounded-full px-2 py-0.5 text-xs',
            sentimentTone[topic.sentiment],
          )}
        >
          {topic.sentiment}
        </span>
      ) : null}
    </button>
  );
}
