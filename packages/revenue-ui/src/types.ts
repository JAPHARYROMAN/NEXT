export type RevenueSource = 'subscriptions' | 'tips' | 'premium' | 'sponsorship' | 'commerce';

export interface RevenueMetric {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly trend?: readonly number[];
}

export interface PayoutRecord {
  readonly id: string;
  readonly amount: string;
  readonly status: 'available' | 'pending' | 'scheduled' | 'failed' | 'hold';
  readonly date: string;
  readonly methodLabel?: string;
}

export interface LedgerEntry {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly amount: string;
  readonly source: RevenueSource;
}

export type RevenueHealth = 'healthy' | 'stable' | 'attention';
