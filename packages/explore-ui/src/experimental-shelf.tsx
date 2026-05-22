'use client';

import clsx from 'clsx';
import { MediaCard } from '@next/ui';

export interface ExperimentalItem {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly href: string;
  readonly hue?: number;
}

export interface ExperimentalShelfProps {
  readonly title?: string;
  readonly items: readonly ExperimentalItem[];
  readonly className?: string;
}

export function ExperimentalShelf({
  title = 'Experimental media',
  items,
  className,
}: ExperimentalShelfProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label={title}>
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            creator={item.creator}
            href={item.href}
            {...(item.hue != null ? { thumbnailHue: item.hue } : {})}
          />
        ))}
      </div>
    </section>
  );
}
