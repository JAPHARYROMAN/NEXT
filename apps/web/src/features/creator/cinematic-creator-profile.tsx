'use client';

import Link from 'next/link';
import { ProfileHero, CommunitySpace, WatchPartyShell } from '@next/creator-ui';
import { focusRing } from '@next/design-system';
import clsx from 'clsx';
import { AdaptiveLayout } from '@next/layout-engine';
import { FeedContainer, MediaCard } from '@next/ui';
import { TheaterShell } from '@next/media-ui';
import { demoFeedItems } from '@/lib/demo-feed';
import { useScrollMotion } from '@next/animation-system';

export function CinematicCreatorProfile({ handle }: { handle: string }) {
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
  const { progress } = useScrollMotion(160);
  const items = demoFeedItems
    .filter((i) => i.creator.toLowerCase().includes(handle.slice(0, 2)) || true)
    .slice(0, 6);

  return (
    <AdaptiveLayout
      className="creator-profile"
      main={
        <div
          className="mx-auto max-w-5xl space-y-10 p-6 md:p-10"
          style={{ transform: `translateY(${progress * -8}px)` }}
        >
          <ProfileHero
            handle={handle}
            displayName={displayName}
            bio="Cinematic storyteller — calm discovery, cultural depth, imperfect creativity preserved."
            followerLabel="24k resonances"
            live={handle === 'vault'}
            featuredCount={items.length}
          />
          <TheaterShell title={`Featured — ${displayName}`} mode="theater" />
          <FeedContainer title="Featured media">
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
        </div>
      }
      rail={
        <div className="space-y-6 p-6">
          <Link href={`/creator/${handle}/community`} className={clsx('block', focusRing)}>
            <CommunitySpace name={`${displayName}'s circle`} members="2.4k" activeNow={12} />
          </Link>
          <Link href="/watch-party/premiere-aurora" className={clsx('block', focusRing)}>
            <WatchPartyShell title="Community premiere" participants={['Alex', 'Jordan']} />
          </Link>
        </div>
      }
    />
  );
}
