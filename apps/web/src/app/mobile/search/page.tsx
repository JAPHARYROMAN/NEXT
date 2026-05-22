import Link from 'next/link';
import { MobileExperienceShell } from '@/features/mobile/mobile-experience-shell';

export default function MobileSearchRoute() {
  return (
    <MobileExperienceShell title="Search">
      <div className="px-4 py-6">
        <p className="text-sm text-muted">Semantic search with mobile-optimized results.</p>
        <Link href="/search" className="mt-4 inline-block min-h-[44px] text-brand">
          Open search →
        </Link>
      </div>
    </MobileExperienceShell>
  );
}
