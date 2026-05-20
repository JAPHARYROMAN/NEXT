import { FeedGrid } from '@/features/feed/feed-grid';

export const metadata = { title: 'Home' };

export default function HomePage() {
  return <FeedGrid title="Your feed" />;
}
