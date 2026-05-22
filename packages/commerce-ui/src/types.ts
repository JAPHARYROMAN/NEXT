export interface StoreProduct {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priceLabel: string;
  readonly type: 'digital' | 'bundle' | 'preset';
  readonly hue?: number;
}

export interface PurchaseRecord {
  readonly id: string;
  readonly productTitle: string;
  readonly purchasedAt: string;
  readonly accessState: 'available' | 'expired' | 'refund_pending';
}
