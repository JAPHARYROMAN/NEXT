import { notFound } from 'next/navigation';
import { CommunityHome } from '@/features/community/community-home';
import { getCommunityBySlug } from '@/lib/demo-communities';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);
  return {
    title: community ? `${community.name} — NEXT` : 'Community — NEXT',
  };
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);
  if (!community) notFound();
  return <CommunityHome community={community} />;
}
