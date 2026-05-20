'use client';

import clsx from 'clsx';
import { MediaCard } from '@next/ui';

export interface NicheShelfProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly items: readonly {
    id: string;
    title: string;
    creator: string;
    href: string;
    hue?: number;
  }[];
  readonly className?: string;
}

export function NicheShelf({ title, subtitle, items, className }: NicheShelfProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label={title}>
      <div>
        <h3 className="font-display text-lg font-medium">{title}</h3>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
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
