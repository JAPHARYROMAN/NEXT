'use client';

import { CinematicPlayer } from '@next/player-ui';
import { Surface } from '@next/ui';
import { InteractionRail } from '@next/chat-ui';
import { StreamStatusBadge } from '@next/live-ui';
import type { LiveStream } from '@/lib/demo-live';

export interface LiveStageProps {
  readonly stream: LiveStream;
}

export function LiveStage({ stream }: LiveStageProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <StreamStatusBadge status={stream.status} />
        <span className="text-xs text-muted">{stream.category}</span>
      </div>
      <CinematicPlayer mediaId={stream.id} title={stream.title} kind="live" durationSec={0} />
      <Surface bordered className="p-3">
        <InteractionRail />
      </Surface>
    </div>
  );
}
