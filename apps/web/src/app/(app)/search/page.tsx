import { Suspense } from 'react';
import { SearchExperience } from '@/features/search/search-experience';

export const metadata = {
  title: 'Search — NEXT',
  description: 'Semantic search — discover by meaning, mood, and creator voice.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted">Loading search…</div>}>
      <SearchExperience />
    </Suspense>
  );
}
