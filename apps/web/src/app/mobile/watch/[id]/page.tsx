import { MobileWatchPage } from '@/features/mobile/mobile-watch-page';

export default async function MobileWatchRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MobileWatchPage id={id} title={`Watch ${id}`} />;
}
