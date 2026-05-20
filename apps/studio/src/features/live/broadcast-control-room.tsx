'use client';

import { useEffect } from 'react';
import {
  BroadcastDashboard,
  StreamHealthMetrics,
  ClipHighlightPanel,
  EventChecklist,
} from '@next/broadcast-ui';
import { ControlRoomLayout } from '@next/layout-engine';
import { LiveChatPanel } from '@next/chat-ui';
import { ModerationConsole } from '@next/moderation-ui';
import { LiveMonetizationShell } from '@next/monetization-ui';
import { StudioPageHeader } from '@next/studio-components';
import { Button, Surface } from '@next/ui';
import {
  useLiveSessionStore,
  trackControlRoomLatency,
  trackStreamHealthPanel,
} from '@next/frontend-utils';
import {
  demoClipMarkers,
  demoEventChecklist,
  demoFlagged,
  demoHealthMetrics,
  demoMuted,
} from '@/lib/demo-broadcast';

const demoChat = [
  { id: '1', author: 'Viewer', body: 'Sound is crisp.' },
  { id: '2', author: 'Mod', body: 'Welcome everyone.' },
];

export function BroadcastControlRoom() {
  const isLive = useLiveSessionStore((s) => s.isLive);
  const health = useLiveSessionStore((s) => s.health);
  const viewers = useLiveSessionStore((s) => s.viewerCount);
  const setLive = useLiveSessionStore((s) => s.setLive);
  const setHealth = useLiveSessionStore((s) => s.setHealth);
  const setViewerCount = useLiveSessionStore((s) => s.setViewerCount);
  const setPhase = useLiveSessionStore((s) => s.setPhase);

  useEffect(() => {
    trackStreamHealthPanel('mount', 0);
  }, []);

  const overall = health === 'healthy' ? 'ok' : health === 'degraded' ? 'watch' : 'attention';

  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Broadcast control room"
        subtitle="Mission-control calm — health, chat, moderation, clips."
        actions={
          <Button
            variant={isLive ? 'danger' : 'primary'}
            onClick={() => {
              const start = performance.now();
              setLive(!isLive);
              if (!isLive) {
                setPhase('live');
                setHealth('healthy');
                setViewerCount(128);
              } else {
                setPhase('ended');
              }
              trackControlRoomLatency('toggle_live', performance.now() - start);
            }}
          >
            {isLive ? 'End stream' : 'Go live (demo)'}
          </Button>
        }
      />

      <BroadcastDashboard viewerCount={viewers} chatRatePerMin={24} tipCount={3} />

      <ControlRoomLayout
        preview={
          <Surface bordered className="aspect-video p-6">
            <p className="text-sm text-muted">Stream preview — ingest pipeline pending</p>
            {isLive ? (
              <p className="mt-4 text-lg font-medium" aria-live="polite">
                {viewers} watching
              </p>
            ) : null}
          </Surface>
        }
        health={<StreamHealthMetrics metrics={demoHealthMetrics} overall={overall} />}
        chat={<LiveChatPanel messages={demoChat} slowMode />}
        moderation={
          <ModerationConsole
            flagged={[...demoFlagged]}
            muted={[...demoMuted]}
            escalation="1 message awaiting review — no panic UI"
          />
        }
        clips={<ClipHighlightPanel markers={demoClipMarkers} />}
        monetization={<LiveMonetizationShell tipsEnabled paidEvent />}
      />

      <EventChecklist items={[...demoEventChecklist]} />
    </div>
  );
}
