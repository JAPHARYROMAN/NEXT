'use client';

import Link from 'next/link';
import { MobileCreatorDashboard } from '@next/mobile-ui';
import { MobileExperienceShell } from './mobile-experience-shell';

export function MobileCreatorPage() {
  return (
    <MobileExperienceShell title="Creator">
      <div className="px-4 py-6">
        <MobileCreatorDashboard
          uploadAction={
            <Link
              href="/studio/upload"
              className="flex min-h-[48px] items-center justify-center rounded-xl bg-brand font-medium text-white"
            >
              Quick upload
            </Link>
          }
          analyticsPreview={
            <p className="text-sm text-muted">
              Views +12% · calm retention · mobile preview only (demo).
            </p>
          }
        />
      </div>
    </MobileExperienceShell>
  );
}
