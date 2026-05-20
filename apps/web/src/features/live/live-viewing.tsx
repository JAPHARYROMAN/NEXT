'use client';

import { useEffect } from 'react';
import { MediaViewport } from '@next/layout-engine';
import { LiveWatchLayout } from '@next/layout-engine';
import { EventMetadataPanel, PostLiveTransition, ReplayChapterMarkers } from '@next/live-ui';
import { trackLiveViewingEngagement } from '@next/frontend-utils';
import { LiveStage } from '@/features/live/live-stage';
import { LiveSidebar } from '@/features/live/live-sidebar';
import { demoLiveStreams, demoReplayChapters } from '@/lib/demo-live';

export interface LiveViewingProps {
  readonly streamId?: string;
}

export function LiveViewing({ streamId }: LiveViewingProps) {
  const active = demoLiveStreams.find((s) => s.id === streamId) ?? demoLiveStreams[0]!;

  useEffect(() => {
    trackLiveViewingEngagement(active.id, 'view_mount');
  }, [active.id]);

  return (
    <MediaViewport className="space-y-8">
      <EventMetadataPanel
        metadata={{
          title: active.title,
          creator: active.creator,
          ...(active.category ? { category: active.category } : {}),
        }}
      />

      {active.status === 'ended' ? (
        <PostLiveTransition replayHref={`/watch/${active.id}`} discussionHref={`/community/next`} />
      ) : null}

      <LiveWatchLayout
        stage={<LiveStage stream={active} />}
        sidebar={<LiveSidebar stream={active} activeId={active.id} />}
      />

      {active.status === 'ended' ? (
        <ReplayChapterMarkers chapters={[...demoReplayChapters]} />
      ) : null}
    </MediaViewport>
  );
}
