'use client';

import {
  BillingStatusPanel,
  CancellationFlow,
  MembershipTierCard,
  RenewalTransparency,
  TierComparisonTable,
} from '@next/subscription-ui';
import { FinancialSafetyNotice, RefundPolicyShell } from '@next/monetization-ui';
import { Surface } from '@next/ui';
import {
  trackSubscriptionFlow,
  trackTierComparison,
  useSubscriptionFlowStore,
} from '@next/frontend-utils';
import { demoBillingStatus, demoMembershipTiers } from '@/lib/demo-monetization';

export function SubscriptionsExperience() {
  const { selectedTierId, selectTier, step, setStep } = useSubscriptionFlowStore();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Subscriptions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Transparent membership — clear pricing, easy cancellation, no retention maze.
        </p>
      </header>
      <FinancialSafetyNotice />
      <div className="grid gap-4 md:grid-cols-3">
        {demoMembershipTiers.map((tier) => (
          <MembershipTierCard
            key={tier.id}
            tier={tier}
            selected={selectedTierId === tier.id}
            onSelect={(id) => {
              selectTier(id);
              trackTierComparison(id, 'select');
              trackSubscriptionFlow('tier_selected', { tierId: id });
            }}
          />
        ))}
      </div>
      <Surface bordered className="p-5">
        <h2 className="text-sm font-medium text-fg">Compare tiers</h2>
        <TierComparisonTable tiers={demoMembershipTiers} className="mt-4" />
      </Surface>
      <div className="grid gap-4 lg:grid-cols-2">
        <BillingStatusPanel
          billing={demoBillingStatus}
          onManage={() => setStep('billing')}
          onCancel={() => setStep('confirm')}
        />
        <RenewalTransparency
          renewsAt="Jun 1, 2026"
          amountLabel="$12"
          paymentMethodLabel="Card ending 4242"
        />
      </div>
      {step === 'confirm' ? (
        <CancellationFlow
          tierName={demoBillingStatus.tierName}
          accessUntil="Jun 1, 2026"
          onConfirmCancel={() => trackSubscriptionFlow('cancel_confirmed')}
          onKeep={() => setStep('browse')}
        />
      ) : null}
      <RefundPolicyShell />
    </div>
  );
}
