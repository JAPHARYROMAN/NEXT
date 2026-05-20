'use client';

import {
  PayoutSchedule,
  PayoutStatusPanel,
  RevenueHealthIndicator,
  RevenueLedgerPreview,
  RevenueOverview,
  RevenueSourceBreakdown,
} from '@next/revenue-ui';
import { StudioPageHeader } from '@next/studio-components';
import { Surface } from '@next/ui';
import { trackPayoutInteraction, useRevenueFilterStore } from '@next/frontend-utils';
import clsx from 'clsx';
import {
  demoLedger,
  demoPayouts,
  demoRevenueMetrics,
  demoRevenueSources,
} from '@/lib/demo-revenue';

const ranges = ['7d', '28d', '90d', '365d'] as const;
const sources = ['all', 'subscriptions', 'tips', 'premium', 'sponsorship', 'commerce'] as const;

export function RevenueDashboard() {
  const { range, source, setRange, setSource } = useRevenueFilterStore();

  return (
    <div className="space-y-8">
      <StudioPageHeader
        title="Revenue"
        subtitle="Earnings, source breakdown, payout status — transparent and creator-first."
      />
      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-xs',
              range === r ? 'bg-accent text-accent-fg' : 'border border-subtle/20 text-muted',
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <RevenueOverview metrics={demoRevenueMetrics} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueSourceBreakdown sources={demoRevenueSources} />
        </div>
        <RevenueHealthIndicator health="healthy" />
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-xs capitalize',
              source === s ? 'bg-elevated text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <PayoutStatusPanel availableTotal="$1,240" pendingTotal="$380" payouts={demoPayouts} />
        <PayoutSchedule
          nextPayoutDate="May 25, 2026"
          frequency="Weekly (Tuesdays)"
          minimumThreshold="$50"
          methodLabel="Bank account ·••• 4821"
        />
      </div>
      <RevenueLedgerPreview
        entries={demoLedger}
        onDownloadStatement={() => trackPayoutInteraction('download_statement')}
      />
      <Surface bordered className="p-5">
        <p className="text-sm text-muted">
          Payment provider and ledger service integration — contract-ready UI shell.
        </p>
      </Surface>
    </div>
  );
}
