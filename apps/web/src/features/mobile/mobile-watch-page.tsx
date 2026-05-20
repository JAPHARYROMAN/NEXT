'use client';

import { useEffect } from 'react';
import { useContinuityStore, usePlayerStore } from '@next/frontend-utils';
import { MobilePlayerShell } from '@next/mobile-ui';
import { MobileExperienceShell } from './mobile-experience-shell';

export interface MobileWatchPageProps {
  readonly id: string;
  readonly title?: string;
}

export function MobileWatchPage({ id, title = 'Cinematic session' }: MobileWatchPageProps) {
  const open = usePlayerStore((s) => s.open);
  const setResume = useContinuityStore((s) => s.setResume);
  const setLastDevice = useContinuityStore((s) => s.setLastDevice);

  useEffect(() => {
    open(id, title, 'theater', 'long');
    setResume({ mediaId: id, title, positionSec: 0, updatedAt: Date.now() });
    setLastDevice('phone');
  }, [id, title, open, setResume, setLastDevice]);

  return (
    <MobileExperienceShell title={title} immersive>
      <div className="relative min-h-[60dvh] bg-black">
        <MobilePlayerShell mediaId={id} title={title} />
      </div>
    </MobileExperienceShell>
  );
}
