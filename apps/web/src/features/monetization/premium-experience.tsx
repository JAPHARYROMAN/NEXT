'use client';

import {
  PremiumContentPreview,
  PurchaseDecisionSurface,
  PaidCommunityLanding,
  GatedSection,
  MemberEventsPanel,
} from '@next/monetization-ui';
import { EntitlementStatePanel } from '@next/entitlement-ui';
import { Surface } from '@next/ui';
import { trackEntitlementImpression } from '@next/frontend-utils';
import { useEffect } from 'react';
import { demoEntitlements, demoMembershipTiers, getCreatorByHandle } from '@/lib/demo-monetization';

export function PremiumExperience() {
  useEffect(() => {
    trackEntitlementImpression('premium-doc-1', 'not_entitled');
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Premium content</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Additive access — never hostile paywalls. Preview freely, unlock when ready.
        </p>
      </header>
      <PremiumContentPreview
        title="Field notes — Iceland"
        description="Extended cut with location notes and raw audio stems."
        state="not_entitled"
        preview={
          <Surface bordered className="p-8 text-center text-sm text-muted">
            Preview frame · 2:14 of 18:40
          </Surface>
        }
        onUnlock={() => trackEntitlementImpression('premium-doc-1', 'pending_payment')}
      />
      <PurchaseDecisionSurface
        options={[
          { id: 'buy', label: 'One-time unlock', priceLabel: '$8' },
          { id: 'member', label: 'Patron membership', priceLabel: '$12/mo' },
        ]}
      />
      <EntitlementStatePanel entitlements={demoEntitlements} />
    </div>
  );
}

export function PaidCommunityExperience({ slug }: { slug: string }) {
  const creator = getCreatorByHandle(slug);
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PaidCommunityLanding
        communityName={`${creator.displayName} — member space`}
        tagline={creator.tagline}
        memberCount={creator.memberCount}
        tiers={demoMembershipTiers.slice(0, 2)}
        benefitsPreview={['Premium discussions', 'Member-only events', 'Early releases']}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <GatedSection title="Member lounge" locked>
          <p>Visible when entitled</p>
        </GatedSection>
        <MemberEventsPanel
          events={[
            { id: 'ev1', title: 'Listening session', schedule: 'Sun · 8pm' },
            { id: 'ev2', title: 'Feedback circle', schedule: 'Wed · 6pm' },
          ]}
        />
      </div>
    </div>
  );
}
