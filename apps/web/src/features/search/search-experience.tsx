'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SearchBar,
  IntentModes,
  QueryRefinement,
  SearchFiltersPanel,
  RecentSavedSearches,
  SearchResults,
} from '@next/search-ui';
import { SearchLayout } from '@next/layout-engine';
import {
  useSearchDiscoveryStore,
  trackSearchLatency,
  trackSearchResultClick,
  trackQueryRefinement,
  trackZeroResultFriction,
} from '@next/frontend-utils';
import {
  buildDemoSearchResults,
  demoRefinementChips,
  demoSearchSuggestions,
} from '@/lib/demo-search';

export function SearchExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const query = useSearchDiscoveryStore((s) => s.query);
  const intent = useSearchDiscoveryStore((s) => s.intent);
  const filters = useSearchDiscoveryStore((s) => s.filters);
  const resultLayout = useSearchDiscoveryStore((s) => s.resultLayout);
  const refinementIds = useSearchDiscoveryStore((s) => s.refinementIds);
  const recentSearches = useSearchDiscoveryStore((s) => s.recentSearches);
  const savedSearches = useSearchDiscoveryStore((s) => s.savedSearches);
  const setQuery = useSearchDiscoveryStore((s) => s.setQuery);
  const setIntent = useSearchDiscoveryStore((s) => s.setIntent);
  const setFilters = useSearchDiscoveryStore((s) => s.setFilters);
  const toggleRefinement = useSearchDiscoveryStore((s) => s.toggleRefinement);
  const addRecentSearch = useSearchDiscoveryStore((s) => s.addRecentSearch);
  const hydrateFromParams = useSearchDiscoveryStore((s) => s.hydrateFromParams);
  const toSearchParams = useSearchDiscoveryStore((s) => s.toSearchParams);

  useEffect(() => {
    hydrateFromParams(searchParams);
  }, [searchParams.toString(), hydrateFromParams]);

  const suggestions = useMemo(
    () =>
      query.length > 1
        ? demoSearchSuggestions.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
        : [],
    [query],
  );

  const sections = useMemo(() => buildDemoSearchResults(query), [query]);

  const runSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      setQuery(trimmed);
      if (trimmed) addRecentSearch(trimmed);
      const start = performance.now();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        trackSearchLatency(trimmed, Math.round(performance.now() - start), intent);
        const total = buildDemoSearchResults(trimmed).reduce((n, s) => n + s.items.length, 0);
        if (trimmed && total === 0) trackZeroResultFriction(trimmed, intent);
      }, 280);
      const params = toSearchParams();
      params.set('q', trimmed);
      router.replace(`/search?${params.toString()}`);
    },
    [addRecentSearch, intent, router, setQuery, toSearchParams],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Search</h1>
        <p className="max-w-2xl text-muted">
          Semantic discovery — search by meaning, mood, and creator voice. Not keyword matching.
        </p>
      </header>

      <SearchBar
        value={query}
        suggestions={suggestions}
        onChange={setQuery}
        onSubmit={runSearch}
        onSuggestionSelect={(_, label) => runSearch(label)}
      />

      <IntentModes
        active={intent}
        onChange={(next) => {
          setIntent(next);
          if (query) runSearch(query);
        }}
      />

      <SearchLayout
        sidebar={
          <div className="space-y-6">
            <SearchFiltersPanel filters={filters} onChange={setFilters} />
            <RecentSavedSearches
              recent={recentSearches}
              saved={savedSearches}
              onSelect={runSearch}
            />
          </div>
        }
      >
        <QueryRefinement
          chips={demoRefinementChips}
          activeIds={refinementIds}
          onToggle={(id) => {
            toggleRefinement(id);
            trackQueryRefinement(id, query);
          }}
        />

        <SearchResults
          sections={sections}
          layout={resultLayout}
          query={query}
          loading={loading}
          onResultClick={(sectionId, itemId) => trackSearchResultClick(sectionId, itemId, intent)}
        />
      </SearchLayout>
    </div>
  );
}
