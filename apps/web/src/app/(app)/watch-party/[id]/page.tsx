import { notFound } from 'next/navigation';
import { WatchPartyExperience } from '@/features/watch-party/watch-party-experience';
import { getWatchPartyById } from '@/lib/demo-watch-party';

export default async function WatchPartyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const party = getWatchPartyById(id);
  if (!party) notFound();
  return <WatchPartyExperience party={party} />;
}
