'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { WatchPartyLayout } from '@next/layout-engine';
import { TheaterPlayer } from '@next/theater-ui';
import { MoodIndicator } from '@next/community-ui';
import { useWatchPartyStore, useTvSessionStore } from '@next/frontend-utils';

export interface WatchPartyTvProps {
  readonly partyId: string;
  readonly title: string;
  readonly mediaId: string;
  readonly creator: string;
  readonly host: string;
  readonly participantCount: number;
  readonly className?: string;
}

/** Couch sync viewing — synced player + ambient social rail. */
export function WatchPartyTv({
  partyId,
  title,
  mediaId,
  creator,
  host,
  participantCount,
  className,
}: WatchPartyTvProps) {
  const phase = useWatchPartyStore((s) => s.phase);
  const setWatchPartyPresence = useTvSessionStore((s) => s.setWatchPartyPresence);

  useEffect(() => {
    setWatchPartyPresence(participantCount);
  }, [participantCount, setWatchPartyPresence]);

  const viewport = <TheaterPlayer mediaId={mediaId} title={title} creator={creator} />;

  const social = (
    <div className="space-y-6 rounded-2xl border border-subtle/15 bg-surface/40 p-6">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm text-muted">Hosted by {host}</p>
      <MoodIndicator mood={phase === 'discussion' ? 'calm' : 'electric'} />
      <p className="text-muted">
        {participantCount} on the couch · party {partyId}
      </p>
    </div>
  );

  return (
    <div className={clsx('p-8 tv:p-12', className)}>
      <WatchPartyLayout viewport={viewport} social={social} />
    </div>
  );
}
