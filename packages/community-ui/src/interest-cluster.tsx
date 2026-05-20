'use client';

import clsx from 'clsx';

export interface InterestCluster {
  readonly id: string;
  readonly label: string;
  readonly communities: readonly { slug: string; name: string; href: string }[];
}

export interface InterestClusterProps {
  readonly cluster: InterestCluster;
  readonly onCommunityClick?: (slug: string) => void;
  readonly className?: string;
}

export function InterestClusterView({
  cluster,
  onCommunityClick,
  className,
}: InterestClusterProps) {
  return (
    <section className={clsx('space-y-3', className)} aria-label={cluster.label}>
      <h3 className="font-display text-lg font-medium">{cluster.label}</h3>
      <ul className="flex flex-wrap gap-2">
        {cluster.communities.map((c) => (
          <li key={c.slug}>
            <a
              href={c.href}
              className="rounded-full border border-subtle/20 px-3 py-1 text-sm hover:border-accent/40"
              onClick={() => onCommunityClick?.(c.slug)}
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
