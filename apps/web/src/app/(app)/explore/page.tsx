import { FeedGrid } from '@/features/feed/feed-grid';
import { CommunityRail } from '@/features/explore/community-rail';

export const metadata = { title: 'Explore' };

export default function ExplorePage() {
  return (
    <div className="space-y-12">
      <CommunityRail />
      <FeedGrid title="Explore worlds" />
    </div>
  );
}
