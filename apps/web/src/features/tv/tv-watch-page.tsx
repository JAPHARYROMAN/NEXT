'use client';

import { TheaterPlayer } from '@next/theater-ui';
import { TvExperienceShell } from '@next/tv-ui';
import { demoTheaterChapters } from '@/lib/demo-tv';

export function TvWatchPage({
  mediaId,
  title = 'Echoes in Static',
  creator = 'Jordan Reyes',
}: {
  readonly mediaId: string;
  readonly title?: string;
  readonly creator?: string;
}) {
  return (
    <TvExperienceShell title="Theater playback">
      <TheaterPlayer
        mediaId={mediaId}
        title={title}
        creator={creator}
        synopsis="Immersive large-screen session with ambient overlays and remote-friendly controls."
        chapters={[...demoTheaterChapters]}
      />
    </TvExperienceShell>
  );
}
