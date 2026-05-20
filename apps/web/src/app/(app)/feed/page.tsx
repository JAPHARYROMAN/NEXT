import { CinematicFeedPage } from '@/features/feed/cinematic-feed-page';
import { FirstRunPanel } from '@/features/onboarding/first-run-panel';

export const metadata = { title: 'Feed' };

export default function FeedPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <FirstRunPanel />
      </div>
      <CinematicFeedPage />
    </>
  );
}
