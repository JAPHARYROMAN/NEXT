'use client';

import { AdaptiveFeed } from '@next/feed-ui';
import { demoFeedItems } from '@/lib/demo-feed';

export function CinematicFeedPage() {
  return <AdaptiveFeed title="Your feed" items={demoFeedItems} />;
}
