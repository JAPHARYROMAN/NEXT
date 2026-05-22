import { CinematicCreatorProfile } from '@/features/creator/cinematic-creator-profile';

export default async function CreatorPublicPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <CinematicCreatorProfile handle={handle} />;
}
