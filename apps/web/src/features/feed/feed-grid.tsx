'use client';

import { useEffect } from 'react';
import { FeedContainer, MediaCard } from '@next/ui';
import { useFeedStore } from '@next/frontend-utils';
import { demoFeedItems } from '@/lib/demo-feed';

export function FeedGrid({ title = 'For you' }: { title?: string }) {
  const items = useFeedStore((s) => s.items);
  const setItems = useFeedStore((s) => s.setItems);

  useEffect(() => {
    if (items.length === 0) setItems(demoFeedItems);
  }, [items.length, setItems]);

  return (
    <FeedContainer title={title}>
      {items.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title}
          creator={item.creator}
          href={`/watch/${item.id}`}
          thumbnailHue={item.thumbnailHue}
        />
      ))}
    </FeedContainer>
  );
}
