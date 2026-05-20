import { CreatorProfile } from '@/features/creator/creator-profile';

export const metadata = { title: 'Creator' };

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <CreatorProfile handle={handle} />;
}
