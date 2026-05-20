import Link from 'next/link';
import { MobileExperienceShell } from '@/features/mobile/mobile-experience-shell';

export default function MobileExploreRoute() {
  return (
    <MobileExperienceShell title="Explore">
      <div className="px-4 py-6">
        <p className="text-sm text-muted">Discovery surfaces use the main explore experience.</p>
        <Link href="/explore" className="mt-4 inline-block min-h-[44px] text-brand">
          Open full explore →
        </Link>
      </div>
    </MobileExperienceShell>
  );
}
