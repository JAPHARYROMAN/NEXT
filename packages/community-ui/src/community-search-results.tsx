'use client';

import clsx from 'clsx';
import { CommunityCard } from '@next/ui';
import { CommunityHealthIndicator } from './community-health-indicator';

export interface CommunitySearchResult {
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: string;
  readonly href: string;
  readonly mood?: 'calm' | 'chaos' | 'learn';
  readonly healthScore?: number;
  readonly matchReason?: string;
}

export interface CommunitySearchResultsProps {
  readonly results: readonly CommunitySearchResult[];
  readonly query?: string;
  readonly className?: string;
}

export function CommunitySearchResults({ results, query, className }: CommunitySearchResultsProps) {
  if (results.length === 0 && query) {
    return (
      <p className={clsx('text-center text-muted', className)}>
        No communities match &ldquo;{query}&rdquo; — try broader terms or explore emerging spaces.
      </p>
    );
  }

  return (
    <ul
      className={clsx('grid gap-4 sm:grid-cols-2', className)}
      aria-label="Community search results"
    >
      {results.map((r) => (
        <li key={r.slug} className="space-y-2">
          <CommunityCard
            id={r.slug}
            name={r.name}
            description={r.description}
            memberCount={r.memberCount}
            href={r.href}
            {...(r.mood ? { mood: r.mood } : {})}
          />
          {r.healthScore != null ? <CommunityHealthIndicator score={r.healthScore} /> : null}
          {r.matchReason ? <p className="text-xs text-muted">{r.matchReason}</p> : null}
        </li>
      ))}
    </ul>
  );
}
