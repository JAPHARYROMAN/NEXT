import { ImmersiveWatch } from '@/features/watch/immersive-watch';
import { demoWatchById } from '@/lib/demo-watch';

export const metadata = { title: 'Watch' };

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = demoWatchById[id] ?? {
    id,
    title: `Media ${id}`,
    creator: '@next',
    thumbnailHue: 200,
    kind: 'long' as const,
    durationSec: 600,
    description: 'Placeholder media — add to demo catalog or connect CMS.',
  };

  return <ImmersiveWatch media={media} />;
}
