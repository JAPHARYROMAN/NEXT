import { TvLivePage } from '@/features/tv/tv-live-page';

export default async function TvLiveRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TvLivePage eventId={id} />;
}
