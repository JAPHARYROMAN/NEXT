import { TvPartyPage } from '@/features/tv/tv-party-page';

export default async function TvPartyRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TvPartyPage partyId={id} />;
}
