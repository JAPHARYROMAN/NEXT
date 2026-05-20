'use client';

import { HandoffCard } from '@next/mobile-ui';
import { useContinuityStore } from '@next/frontend-utils';
import { MobileExperienceShell } from './mobile-experience-shell';

export function MobileContinuityPage() {
  const requestHandoff = useContinuityStore((s) => s.requestHandoff);
  const resume = useContinuityStore((s) => s.resume);

  return (
    <MobileExperienceShell title="Continuity">
      <div className="space-y-6 px-4 py-6">
        <HandoffCard />
        {resume ? (
          <div className="flex flex-wrap gap-3">
            {(['tablet', 'desktop', 'tv'] as const).map((device) => (
              <button
                key={device}
                type="button"
                className="min-h-[44px] rounded-xl border border-subtle/15 px-4 text-sm"
                onClick={() => requestHandoff(device)}
              >
                Hand off to {device}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Watch something to enable resume and handoff.</p>
        )}
      </div>
    </MobileExperienceShell>
  );
}
