'use client';

import { CreatorCard, FeedContainer, MediaCard } from '@next/ui';
import { demoFeedItems } from '@/lib/demo-feed';

export function CreatorProfile({ handle }: { handle: string }) {
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return (
    <div className="space-y-8">
      <CreatorCard
        handle={handle}
        displayName={displayName}
        bio="Cinematic storyteller exploring calm discovery and cultural depth."
        followerLabel="24k resonances"
        href={`/creator/${handle}`}
        live={handle === 'vault'}
      />
      <FeedContainer title="Featured">
        {demoFeedItems.slice(0, 3).map((item) => (
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
    </div>
  );
}
