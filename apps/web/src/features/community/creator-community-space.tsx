'use client';

import { CreatorCommunityShell } from '@next/social-ui';
import { demoDiscussions, demoTimeline } from '@/lib/demo-communities';

export function CreatorCommunitySpace({
  handle,
  displayName,
}: {
  handle: string;
  displayName: string;
}) {
  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <CreatorCommunityShell
        creatorName={displayName}
        handle={handle}
        memberCount="2.4k"
        activeNow={12}
        pinnedMessage="Thank you for being here — this circle is for generous conversation, not performance."
        ritual={{
          title: 'Monthly AMA ritual',
          schedule: 'First Friday · 7pm',
          description: 'Bring questions, leave rage-bait at the door.',
        }}
        timeline={demoTimeline}
        discussions={demoDiscussions}
      />
    </div>
  );
}
