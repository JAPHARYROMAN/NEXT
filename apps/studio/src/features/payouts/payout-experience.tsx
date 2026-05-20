'use client';

import { PayoutSchedule, PayoutStatusPanel, RevenueLedgerPreview } from '@next/revenue-ui';
import { StudioPageHeader } from '@next/studio-components';
import { Surface } from '@next/ui';
import { trackPayoutInteraction } from '@next/frontend-utils';
import { demoLedger, demoPayouts } from '@/lib/demo-revenue';

export function PayoutExperience() {
  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Payouts"
        subtitle="Schedule, method, failed/hold states — calm financial clarity."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <PayoutStatusPanel availableTotal="$1,240" pendingTotal="$380" payouts={demoPayouts} />
        <PayoutSchedule
          nextPayoutDate="May 25, 2026"
          frequency="Weekly (Tuesdays)"
          minimumThreshold="$50"
          methodLabel="Bank account ·••• 4821 (placeholder)"
        />
      </div>
      <RevenueLedgerPreview
        entries={demoLedger}
        onDownloadStatement={() => trackPayoutInteraction('download_statement')}
      />
      <Surface bordered className="p-5">
        <h3 className="text-sm font-medium text-fg">Failed payout example</h3>
        <p className="mt-2 text-sm text-muted">
          If a payout fails, you will see the reason here and can update your method — no hidden
          holds.
        </p>
      </Surface>
    </div>
  );
}
