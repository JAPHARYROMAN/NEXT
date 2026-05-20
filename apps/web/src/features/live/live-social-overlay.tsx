'use client';

import {
  LiveChatShell,
  LivePollShell,
  AudiencePresence,
  PinnedMessage,
  ModerationBanner,
  CreatorCallout,
} from '@next/live-ui';

const demoMessages = [
  { id: '1', author: 'Sam', body: 'The lighting shift at 12:04 ✦' },
  { id: '2', author: 'Riley', body: 'Beautiful pacing.' },
];

export function LiveSocialOverlay() {
  return (
    <div className="space-y-4 rounded-xl border border-subtle/15 p-4">
      <AudiencePresence count={1842} peak={2100} />
      <CreatorCallout creatorName="Host" message="Welcome — kindness over hype." />
      <PinnedMessage author="Mod" body="Remember: constructive energy only." />
      <ModerationBanner message="Slow mode enabled for calmer chat." />
      <LiveChatShell messages={demoMessages} />
      <LivePollShell
        question="What resonated most?"
        options={[
          { id: 'o1', label: 'Visual craft', votes: 42 },
          { id: 'o2', label: 'Sound design', votes: 38 },
          { id: 'o3', label: 'Story rhythm', votes: 55 },
        ]}
      />
    </div>
  );
}
