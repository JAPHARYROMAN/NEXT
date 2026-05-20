'use client';

import {
  CreatorDiscoveryShell,
  CreatorOpportunityCard,
  DeliverablesChecklist,
  ProposalReviewPanel,
  SponsorCampaignShell,
  SponsorshipDisclosureBanner,
} from '@next/sponsorship-ui';
import { CommerceSafetyWarning, SponsorshipDisclosureBadge } from '@next/reputation-ui';
import { Surface } from '@next/ui';
import { trackSponsorshipDropoff, useSponsorshipWorkflowStore } from '@next/frontend-utils';
import { demoSponsorshipOpportunities } from '@/lib/demo-monetization';

export function SponsorshipsExperience({ mode = 'creator' }: { mode?: 'creator' | 'sponsor' }) {
  const { step, setStep, setOpportunity, activeOpportunityId } = useSponsorshipWorkflowStore();
  const active = demoSponsorshipOpportunities.find((o) => o.id === activeOpportunityId);

  if (mode === 'sponsor') {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Sponsor workspace</h1>
          <p className="mt-2 text-sm text-muted">
            Discover creators, review proposals, track campaigns.
          </p>
        </header>
        <SponsorCampaignShell
          campaignName="Spring launch"
          budgetLabel="$5,000"
          creatorsMatched={3}
          performanceLabel="2.4% engagement (demo)"
        />
        <CreatorDiscoveryShell
          creators={[
            {
              handle: 'mira',
              niche: 'Ambient film',
              fitScore: 92,
              audienceLabel: '42k thoughtful viewers',
            },
            { handle: 'sol', niche: 'Documentary', fitScore: 78, audienceLabel: '18k engaged' },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Sponsorships</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Transparent terms, mandatory disclosure, creator-controlled acceptance.
          </p>
        </div>
        <SponsorshipDisclosureBadge brand="Quiet Audio" />
      </header>
      <CommerceSafetyWarning reason="Review all terms before accepting. Decline anything that conflicts with your audience trust." />
      <SponsorshipDisclosureBanner brand="Quiet Audio" />
      <div className="grid gap-4 md:grid-cols-2">
        {demoSponsorshipOpportunities.map((opportunity) => (
          <CreatorOpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onOpen={(id) => {
              setOpportunity(id);
              trackSponsorshipDropoff('opened', id);
            }}
          />
        ))}
      </div>
      {step === 'proposal' && active ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ProposalReviewPanel
            proposal={{
              id: active.id,
              creatorHandle: 'you',
              campaignTitle: active.title,
              termsSummary: `Budget ${active.budgetLabel}. Deliverables: ${active.deliverables.join(', ')}.`,
              status: active.status,
            }}
            onAccept={() => setStep('deliverables')}
            onDecline={() => {
              trackSponsorshipDropoff('declined', active.id);
              setStep('discover');
            }}
          />
          <DeliverablesChecklist
            items={active.deliverables.map((label, i) => ({
              id: `d${i}`,
              label,
              completed: i === 0 && active.status === 'in_progress',
            }))}
          />
        </div>
      ) : null}
      <Surface bordered className="p-5">
        <p className="text-sm text-muted">Escrow and payout integration — contract-ready shell.</p>
      </Surface>
    </div>
  );
}
