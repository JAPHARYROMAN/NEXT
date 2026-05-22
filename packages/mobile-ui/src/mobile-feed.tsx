'use client';

import { useEffect, useState } from 'react';
import { AdaptiveFeed } from '@next/feed-ui';
import { ImmersiveViewport } from '@next/adaptive-layouts';
import { SwipeFeed } from '@next/gesture-system';
import { useFeedStore, trackMobileRenderPerf, type FeedItem } from '@next/frontend-utils';
import { FeedTypeTabs } from '@next/feed-ui';
import clsx from 'clsx';

export interface MobileFeedProps {
  readonly items?: readonly FeedItem[];
  readonly layout?: 'scroll' | 'immersive';
  readonly className?: string;
}

export function MobileFeed({ items, layout = 'scroll', className }: MobileFeedProps) {
  const mode = useFeedStore((s) => s.mode);
  const setMode = useFeedStore((s) => s.setMode);
  const [index, setIndex] = useState(0);
  const storeItems = useFeedStore((s) => s.items);
  const feedItems = items ?? storeItems;

  useEffect(() => {
    const start = performance.now();
    requestAnimationFrame(() =>
      trackMobileRenderPerf('mobile_feed', Math.round(performance.now() - start)),
    );
  }, [layout, mode]);

  if (layout === 'immersive' && feedItems.length) {
    const slides = feedItems.map((item) => (
      <ImmersiveViewport
        key={item.id}
        overlay={
          <div className="space-y-2 text-white">
            <p className="font-display text-lg font-semibold">{item.title}</p>
            <p className="text-sm text-white/70">{item.creator}</p>
          </div>
        }
      >
        <div
          className="h-full w-full bg-gradient-to-b from-zinc-900 to-black"
          role="img"
          aria-label={item.title}
        />
      </ImmersiveViewport>
    ));
    return (
      <div className={className}>
        <div className="absolute left-4 right-4 top-4 z-30">
          <FeedTypeTabs mode={mode} onChange={setMode} />
        </div>
        <SwipeFeed items={slides} index={index} onIndexChange={setIndex} />
      </div>
    );
  }

  return (
    <div className={clsx('px-4', className)}>
      <AdaptiveFeed title="Mobile feed" {...(items ? { items } : {})} />
    </div>
  );
}
