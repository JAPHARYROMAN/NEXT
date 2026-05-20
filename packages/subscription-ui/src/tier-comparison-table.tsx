'use client';

import clsx from 'clsx';
import type { MembershipTier } from './types';

export interface TierComparisonTableProps {
  readonly tiers: readonly MembershipTier[];
  readonly className?: string;
}

export function TierComparisonTable({ tiers, className }: TierComparisonTableProps) {
  const allBenefits = [...new Set(tiers.flatMap((t) => t.benefits))];

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table
        className="w-full min-w-[480px] border-collapse text-left text-sm"
        aria-label="Membership tier comparison"
      >
        <caption className="sr-only">Compare membership tiers, pricing, and benefits</caption>
        <thead>
          <tr className="border-b border-subtle/15">
            <th scope="col" className="py-3 pr-4 font-medium text-muted">
              Benefit
            </th>
            {tiers.map((tier) => (
              <th key={tier.id} scope="col" className="px-3 py-3 font-medium text-fg">
                {tier.name}
                <span className="mt-0.5 block text-xs font-normal text-muted">
                  {tier.priceLabel}/{tier.interval}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allBenefits.map((benefit) => (
            <tr key={benefit} className="border-b border-subtle/10">
              <th scope="row" className="py-3 pr-4 font-normal text-fg">
                {benefit}
              </th>
              {tiers.map((tier) => (
                <td key={tier.id} className="px-3 py-3 text-center">
                  {tier.benefits.includes(benefit) ? (
                    <span aria-label={`Included in ${tier.name}`}>✓</span>
                  ) : (
                    <span className="text-muted" aria-label={`Not included in ${tier.name}`}>
                      —
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
