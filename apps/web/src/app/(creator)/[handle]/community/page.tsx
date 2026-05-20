import { CreatorCommunitySpace } from '@/features/community/creator-community-space';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `@${handle} community — NEXT` };
}

export default async function CreatorCommunityPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
  return <CreatorCommunitySpace handle={handle} displayName={displayName} />;
}
