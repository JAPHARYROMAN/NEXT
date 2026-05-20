'use client';

import { useEffect } from 'react';
import { WatchPartyRoom } from '@next/social-ui';
import { WatchPartyLayout } from '@next/layout-engine';
import { useWatchPartyStore } from '@next/frontend-utils';
import type { DemoWatchParty } from '@/lib/demo-watch-party';
import { demoPostWatchComments } from '@/lib/demo-watch-party';

export function WatchPartyExperience({ party }: { party: DemoWatchParty }) {
  const setParty = useWatchPartyStore((s) => s.setParty);
  const phase = useWatchPartyStore((s) => s.phase);
  const setPhase = useWatchPartyStore((s) => s.setPhase);

  useEffect(() => {
    setParty(party.id, party.host === 'Jordan');
    setPhase('watching');
    return () => useWatchPartyStore.getState().leave();
  }, [party.id, party.host, setParty, setPhase]);

  const viewport = (
    <div className="rounded-xl border border-subtle/15 bg-surface/30 p-4">
      <p className="text-sm font-medium">{party.mediaLabel}</p>
      <div
        className="mt-3 aspect-video rounded-lg bg-elevated"
        aria-label="Synced player viewport"
      />
    </div>
  );

  const social = (
    <WatchPartyRoom
      title={party.title}
      host={party.host}
      participants={party.participants}
      phase={phase === 'discussion' ? 'discussion' : 'watching'}
      postWatchComments={demoPostWatchComments}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-10">
      <WatchPartyLayout viewport={viewport} social={social} />
      <button
        type="button"
        className="text-sm text-accent underline"
        onClick={() => setPhase('discussion')}
      >
        Transition to post-watch discussion
      </button>
    </div>
  );
}
