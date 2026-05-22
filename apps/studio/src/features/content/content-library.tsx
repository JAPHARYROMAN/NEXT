'use client';

import { StudioPageHeader } from '@next/studio-components';
import { MediaCard, FeedContainer } from '@next/ui';

const mockContent = [
  { id: 'c1', title: 'Calm horizons', creator: 'You', thumbnailHue: 220 },
  { id: 'c2', title: 'Night garden', creator: 'You', thumbnailHue: 280 },
  { id: 'c3', title: 'Echo chamber', creator: 'You', thumbnailHue: 40 },
] as const;

export function ContentLibrary() {
  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Content library"
        subtitle="Published works, drafts, and scheduled releases."
      />
      <FeedContainer title="Your catalog">
        {mockContent.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            title={item.title}
            creator={item.creator}
            href={`/content/${item.id}`}
            thumbnailHue={item.thumbnailHue}
          />
        ))}
      </FeedContainer>
    </div>
  );
}
