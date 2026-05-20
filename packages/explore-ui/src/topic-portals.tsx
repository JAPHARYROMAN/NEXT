'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { Surface } from '@next/ui';

export interface TopicPortal {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly hue?: number;
}

export interface TopicPortalsProps {
  readonly portals: readonly TopicPortal[];
  readonly onPortalClick?: (id: string) => void;
  readonly className?: string;
}

export function TopicPortals({ portals, onPortalClick, className }: TopicPortalsProps) {
  return (
    <section className={clsx('space-y-4', className)} aria-label="Topic portals">
      <h2 className="font-display text-xl font-medium">Topic portals</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portals.map((portal) => (
          <Link key={portal.id} href={portal.href} onClick={() => onPortalClick?.(portal.id)}>
            <Surface bordered className="h-full p-4 transition-transform hover:scale-[1.01]">
              <div
                className="mb-3 h-1 w-12 rounded-full"
                style={{ background: `hsl(${portal.hue ?? 200} 60% 50%)` }}
                aria-hidden
              />
              <h3 className="font-medium">{portal.label}</h3>
              <p className="mt-1 text-sm text-muted">{portal.description}</p>
            </Surface>
          </Link>
        ))}
      </div>
    </section>
  );
}
