'use client';

import { WatchPartyTv } from '@next/tv-ui';

export function TvPartyPage({ partyId }: { readonly partyId: string }) {
  return (
    <WatchPartyTv
      partyId={partyId}
      title="Couch screening: Neon Drift"
      mediaId="wp-media-1"
      creator="Jordan Reyes"
      host="Jordan"
      participantCount={8}
    />
  );
}
