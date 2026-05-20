'use client';

import clsx from 'clsx';

export interface MediaCollectionItem {
  readonly id: string;
  readonly title: string;
  readonly hue?: number;
}

export interface MediaCollectionProps {
  readonly title: string;
  readonly items: readonly MediaCollectionItem[];
  readonly className?: string;
}

export function MediaCollection({ title, items, className }: MediaCollectionProps) {
  return (
    <section className={clsx('space-y-3', className)} aria-label={title}>
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="aspect-video rounded-lg border border-subtle/10 p-3"
            style={{
              background: `linear-gradient(145deg, hsl(${item.hue ?? 200} 35% 18%), hsl(${item.hue ?? 200} 25% 10%))`,
            }}
          >
            <span className="line-clamp-2 text-xs font-medium">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
