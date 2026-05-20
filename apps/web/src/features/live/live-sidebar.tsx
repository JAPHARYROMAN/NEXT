'use client';

import Link from 'next/link';
import { CreatorCallout, LivePollShell, ModerationBanner, PinnedMessage } from '@next/live-ui';
import { LiveChatPanel } from '@next/chat-ui';
import { RealtimePresenceShell } from '@next/realtime-ui';
import { LiveMonetizationShell } from '@next/monetization-ui';
import { QuestionQueue } from '@next/chat-ui';
import { Surface } from '@next/ui';
import { demoLiveChat, demoLiveQuestions, demoLiveStreams, type LiveStream } from '@/lib/demo-live';

export interface LiveSidebarProps {
  readonly stream: LiveStream;
  readonly activeId: string;
}

export function LiveSidebar({ stream, activeId }: LiveSidebarProps) {
  return (
    <div className="space-y-4">
      <RealtimePresenceShell count={stream.viewers} peak={stream.viewers + 200} />
      <CreatorCallout creatorName={stream.creator} message="Welcome — kindness over hype." />
      <PinnedMessage author="Mod" body="Constructive energy only." />
      <ModerationBanner message="Slow mode available — calm chat defaults." />
      <LiveChatPanel messages={demoLiveChat} slowMode />
      <QuestionQueue questions={demoLiveQuestions} />
      <LivePollShell
        question="What resonated most?"
        options={[
          { id: 'o1', label: 'Visual craft', votes: 42 },
          { id: 'o2', label: 'Sound design', votes: 38 },
          { id: 'o3', label: 'Story rhythm', votes: 55 },
        ]}
      />
      <LiveMonetizationShell tipsEnabled sponsorshipLabel="Partner — disclosed" />
      <LiveStageList streams={demoLiveStreams} activeId={activeId} />
    </div>
  );
}

function LiveStageList({
  streams,
  activeId,
}: {
  streams: readonly LiveStream[];
  activeId: string;
}) {
  return (
    <Surface bordered className="p-4">
      <h3 className="text-sm font-medium">More live stages</h3>
      <ul className="mt-3 space-y-2">
        {streams.map((s) => (
          <li key={s.id}>
            <Link
              href={`/live/${s.id}`}
              className={
                s.id === activeId
                  ? 'block rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent'
                  : 'block rounded-lg px-3 py-2 text-sm hover:bg-surface/60'
              }
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
