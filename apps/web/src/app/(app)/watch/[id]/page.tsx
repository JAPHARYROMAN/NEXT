import { WatchShell } from '@/features/player/watch-shell';
import { demoFeedItems } from '@/lib/demo-feed';

export const metadata = { title: 'Watch' };

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = demoFeedItems.find((f) => f.id === id);
  const title = item?.title ?? `Media ${id}`;

  return <WatchShell id={id} title={title} />;
}
