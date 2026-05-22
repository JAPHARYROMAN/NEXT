import { LiveViewing } from '@/features/live/live-viewing';

export const metadata = { title: 'Live' };

export default async function LiveStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveViewing streamId={id} />;
}
