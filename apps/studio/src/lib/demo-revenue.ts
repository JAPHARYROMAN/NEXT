import type { RevenueMetric, PayoutRecord, LedgerEntry } from '@next/revenue-ui';

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
