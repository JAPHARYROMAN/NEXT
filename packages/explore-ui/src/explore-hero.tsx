'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { Badge } from '@next/ui';

export interface ExploreHeroProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly searchHref?: string;
  readonly className?: string;
}

export function ExploreHero({
  title = 'Explore',
  subtitle = 'Cultural waves, emerging voices, and meaning-led discovery — calm, curious, alive.',
  searchHref = '/search',
  className,
}: ExploreHeroProps) {
  return (
    <header className={clsx('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{title}</h1>
        <Badge tone="accent">Discovery</Badge>
      </div>
      <p className="max-w-2xl text-muted">{subtitle}</p>
      <Link
        href={searchHref}
        className="inline-flex rounded-full border border-subtle/20 px-4 py-2 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg"
      >
        Search by meaning →
      </Link>
    </header>
  );
}
