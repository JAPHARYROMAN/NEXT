import { LiveEventsExperience } from '@/features/live/live-events-experience';

export const metadata = { title: 'Live event' };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LiveEventsExperience eventId={id} />;
}
