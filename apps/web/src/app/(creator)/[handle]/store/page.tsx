import { CreatorStoreExperience } from '@/features/monetization/store-experience';

export default async function CreatorStorePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <CreatorStoreExperience handle={handle} />;
}
