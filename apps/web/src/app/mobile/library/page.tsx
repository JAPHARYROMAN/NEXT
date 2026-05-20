import Link from 'next/link';
import { MobileExperienceShell } from '@/features/mobile/mobile-experience-shell';

export default function MobileLibraryRoute() {
  return (
    <MobileExperienceShell title="Library">
      <div className="px-4 py-6">
        <p className="text-sm text-muted">Saved media and collections.</p>
        <Link href="/library" className="mt-4 inline-block min-h-[44px] text-brand">
          Open library →
        </Link>
      </div>
    </MobileExperienceShell>
  );
}
