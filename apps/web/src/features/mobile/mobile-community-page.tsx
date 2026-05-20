'use client';

import { MobileCommunityShell } from '@next/mobile-ui';
import { MobileExperienceShell } from './mobile-experience-shell';

export function MobileCommunityPage() {
  return (
    <MobileExperienceShell title="Community">
      <div className="px-4 py-6">
        <MobileCommunityShell
          title="Watch party"
          liveChat={
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted">mira</span> — this lighting is unreal
              </li>
              <li>
                <span className="text-muted">sol</span> — syncing in 3…2…
              </li>
            </ul>
          }
          discussion={
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-subtle/10 p-3">
                Pinned: welcome to the room
              </li>
              <li className="rounded-lg border border-subtle/10 p-3">Thread: best intro tracks?</li>
            </ul>
          }
        />
      </div>
    </MobileExperienceShell>
  );
}
