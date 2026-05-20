'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  useFeedStore,
  trackFeedLatency,
  trackScrollPerf,
  type FeedItem,
} from '@next/frontend-utils';
import { FeedContainer } from '@next/ui';
import { CinematicFeedItem } from './cinematic-feed-item';
import { FeedTypeTabs } from './feed-type-tabs';

export interface AdaptiveFeedProps {
  readonly title?: string;
  readonly items?: readonly FeedItem[];
  readonly className?: string;
}

const densityByMode = {
  precision: 'comfortable',
  discovery: 'comfortable',
  chaos: 'immersive',
  creator: 'compact',
  live: 'compact',
} as const;

export function AdaptiveFeed({
  title = 'Feed',
  items: externalItems,
  className,
}: AdaptiveFeedProps) {
  const items = useFeedStore((s) => s.items);
  const mode = useFeedStore((s) => s.mode);
  const density = useFeedStore((s) => s.density);
  const setItems = useFeedStore((s) => s.setItems);
  const setMode = useFeedStore((s) => s.setMode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadStart = useRef(performance.now());

  useEffect(() => {
    if (externalItems?.length) setItems(externalItems);
  }, [externalItems, setItems]);

  useEffect(() => {
    trackFeedLatency(mode, Math.round(performance.now() - loadStart.current));
  }, [mode]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - last > 500) {
        trackScrollPerf('adaptive_feed', el.scrollTop);
        last = now;
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const resolvedDensity = density ?? densityByMode[mode];

  return (
    <div ref={scrollRef} className={clsx('space-y-8', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">Calm scrolling — no infinite addiction loops.</p>
        </div>
        <FeedTypeTabs mode={mode} onChange={setMode} />
      </div>
      <FeedContainer title={mode.charAt(0).toUpperCase() + mode.slice(1)}>
        {items.map((item, i) => (
          <CinematicFeedItem
            key={`${mode}-${item.id}`}
            item={item}
            density={resolvedDensity}
            index={i}
          />
        ))}
      </FeedContainer>
    </div>
  );
}
