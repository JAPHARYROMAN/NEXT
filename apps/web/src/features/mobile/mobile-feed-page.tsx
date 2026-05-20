'use client';

import { useState } from 'react';
import { MobileFeed } from '@next/mobile-ui';
import { demoFeedItems } from '@/lib/demo-feed';
import { MobileExperienceShell } from './mobile-experience-shell';

export function MobileFeedPage() {
  const [layout, setLayout] = useState<'scroll' | 'immersive'>('scroll');

  return (
    <MobileExperienceShell
      title="Feed"
      immersive={layout === 'immersive'}
      actions={
        <button
          type="button"
          className="min-h-[44px] rounded-lg px-3 text-sm text-brand"
          onClick={() => setLayout((l) => (l === 'scroll' ? 'immersive' : 'scroll'))}
        >
          {layout === 'scroll' ? 'Immersive' : 'Scroll'}
        </button>
      }
    >
      <MobileFeed items={demoFeedItems} layout={layout} />
    </MobileExperienceShell>
  );
}
