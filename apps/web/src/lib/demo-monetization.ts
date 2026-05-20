import type { MembershipTier, BillingStatus } from '@next/subscription-ui';
import type { EntitlementRecord } from '@next/entitlement-ui';
import type { StoreProduct, PurchaseRecord } from '@next/commerce-ui';
import type { SponsorshipOpportunity } from '@next/sponsorship-ui';
import type { RevenueMetric, PayoutRecord, LedgerEntry } from '@next/revenue-ui';

export const demoMembershipTiers: readonly MembershipTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    priceLabel: '$5',
    interval: 'month',
    description: 'Steady support for independent work.',
    benefits: ['Member posts', 'Early access', 'Community badge'],
  },
  {
    id: 'patron',
    name: 'Patron',
    priceLabel: '$12',
    interval: 'month',
    description: 'Deeper access and member events.',
    benefits: ['Everything in Supporter', 'Monthly live Q&A', 'Download packs'],
    highlighted: true,
  },
  {
    id: 'circle',
    name: 'Inner circle',
    priceLabel: '$25',
    interval: 'month',
    description: 'Small group — limited seats.',
    benefits: ['Everything in Patron', 'Private discussions', 'Feedback sessions'],
  },
];

export const demoBillingStatus: BillingStatus = {
  tierName: 'Patron',
  renewsAt: 'Jun 1, 2026',
  amountLabel: '$12/month',
  status: 'active',
  cancelAccessible: true,
};

export const demoEntitlements: readonly EntitlementRecord[] = [
  {
    id: 'e1',
    resourceId: 'premium-doc-1',
    resourceLabel: 'Field notes — Iceland',
    state: 'not_entitled',
  },
  {
    id: 'e2',
    resourceId: 'member-community',
    resourceLabel: 'Night studio community',
    state: 'grace',
    graceEndsAt: 'May 27',
  },
  {
    id: 'e3',
    resourceId: 'preset-pack',
    resourceLabel: 'Ambient preset pack',
    state: 'entitled',
    expiresAt: 'Lifetime access',
  },
];

export const demoStoreProducts: readonly StoreProduct[] = [
  {
    id: 'ambient-pack',
    title: 'Winter ambient pack',
    description: '12 field recordings — WAV + metadata.',
    priceLabel: '$18',
    type: 'digital',
    hue: 200,
  },
  {
    id: 'lighting-presets',
    title: 'Cinematic lighting presets',
    description: 'For DaVinci Resolve — calm grades only.',
    priceLabel: '$24',
    type: 'preset',
    hue: 40,
  },
  {
    id: 'workflow-bundle',
    title: 'Creator workflow bundle',
    description: 'Templates, checklists, and session notes.',
    priceLabel: '$36',
    type: 'bundle',
    hue: 280,
  },
];

export const demoPurchases: readonly PurchaseRecord[] = [
  {
    id: 'p1',
    productTitle: 'Winter ambient pack',
    purchasedAt: 'Apr 12, 2026',
    accessState: 'available',
  },
];

export const demoSponsorshipOpportunities: readonly SponsorshipOpportunity[] = [
  {
    id: 'sp1',
    brand: 'Quiet Audio',
    title: 'Spring headphone launch',
    budgetLabel: '$2,500',
    deliverables: ['60s integration', 'Community post', 'Disclosure label'],
    status: 'proposed',
    payoutEstimate: '$2,100',
    deadline: 'Jun 15',
  },
  {
    id: 'sp2',
    brand: 'Field Journal',
    title: 'Travel notebook series',
    budgetLabel: '$1,200',
    deliverables: ['Dedicated video', 'Pinned mention'],
    status: 'in_progress',
    payoutEstimate: '$980',
  },
];

export const demoRevenueMetrics: readonly RevenueMetric[] = [
  { label: 'Earnings (30d)', value: '$4,280', delta: '+12%', trend: [2, 3, 2.5, 4, 5, 4.8, 6] },
  { label: 'Members', value: '842', delta: '+4%' },
  { label: 'Tips', value: '$620', delta: '+18%' },
  { label: 'Available payout', value: '$1,240', delta: 'Ready' },
];

export const demoPayouts: readonly PayoutRecord[] = [
  {
    id: 'pay1',
    amount: '$620',
    status: 'scheduled',
    date: 'May 25',
    methodLabel: 'Bank ·••• 4821',
  },
  { id: 'pay2', amount: '$380', status: 'pending', date: 'Processing' },
  { id: 'pay3', amount: '$120', status: 'hold', date: 'Review · May 18' },
];

export const demoLedger: readonly LedgerEntry[] = [
  {
    id: 'l1',
    date: 'May 18',
    description: 'Patron membership — renewal',
    amount: '+$12.00',
    source: 'subscriptions',
  },
  {
    id: 'l2',
    date: 'May 17',
    description: 'Quiet Audio sponsorship — milestone',
    amount: '+$980.00',
    source: 'sponsorship',
  },
  {
    id: 'l3',
    date: 'May 16',
    description: 'Winter ambient pack',
    amount: '+$18.00',
    source: 'commerce',
  },
];

export const demoRevenueSources = {
  subscriptions: 42,
  sponsorship: 28,
  commerce: 18,
  tips: 12,
  premium: 8,
};

export function getCreatorByHandle(handle: string) {
  return {
    handle,
    displayName: handle === 'mira' ? 'Mira Sol' : 'Creator',
    tagline: 'Calm cinematic work — member-supported, never ad-driven.',
    memberCount: 842,
  };
}
