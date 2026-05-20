import { CreatorMembershipExperience } from '@/features/monetization/store-experience';
import { SubscriptionsExperience } from '@/features/monetization/subscriptions-experience';

export default async function CreatorMembershipPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return (
    <div className="space-y-8">
      <CreatorMembershipExperience handle={handle} />
      <SubscriptionsExperience />
    </div>
  );
}
