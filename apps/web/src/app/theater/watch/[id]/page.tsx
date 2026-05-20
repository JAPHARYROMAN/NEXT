import { TvWatchPage } from '@/features/tv/tv-watch-page';

export default async function TheaterWatchRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TvWatchPage mediaId={id} />;
}
