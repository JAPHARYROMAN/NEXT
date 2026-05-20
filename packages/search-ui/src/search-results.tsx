'use client';

import clsx from 'clsx';
import { Surface } from '@next/ui';
import { ResultSection } from './result-section';
import type { SearchResultSection, ResultLayout } from './types';

export interface SearchResultsProps {
  readonly sections: readonly SearchResultSection[];
  readonly layout?: ResultLayout;
  readonly query?: string;
  readonly loading?: boolean;
  readonly onResultClick?: (sectionId: string, itemId: string) => void;
  readonly className?: string;
}

export function SearchResults({
  sections,
  layout = 'mixed',
  query,
  loading,
  onResultClick,
  className,
}: SearchResultsProps) {
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  if (loading) {
    return (
      <Surface bordered className={clsx('p-8 text-center text-muted', className)}>
        Searching…
      </Surface>
    );
  }

  if (query && total === 0) {
    return (
      <Surface bordered className={clsx('space-y-3 p-8 text-center', className)}>
        <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-sm text-muted">
          Try explore or chaos intent — discovery works by meaning, not just keywords.
        </p>
      </Surface>
    );
  }

  return (
    <div className={clsx('space-y-10', className)} role="region" aria-label="Search results">
      {sections.map((section) => (
        <ResultSection
          key={section.id}
          title={section.title}
          items={section.items}
          layout={layout}
          onResultClick={(item) => {
            const id =
              item.kind === 'creator'
                ? item.handle
                : item.kind === 'community'
                  ? item.slug
                  : item.id;
            onResultClick?.(section.id, id);
          }}
        />
      ))}
    </div>
  );
}
