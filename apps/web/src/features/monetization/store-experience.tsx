'use client';

import {
  CheckoutPlaceholder,
  ProductDetailPanel,
  PurchaseHistoryPanel,
  StoreProductCard,
} from '@next/commerce-ui';
import { FinancialSafetyNotice } from '@next/monetization-ui';
import { ProfileHero } from '@next/creator-ui';
import { trackStorefrontEngagement, useStorefrontCartStore } from '@next/frontend-utils';
import { useState } from 'react';
import { demoPurchases, demoStoreProducts, getCreatorByHandle } from '@/lib/demo-monetization';

export function CreatorStoreExperience({ handle }: { handle: string }) {
  const creator = getCreatorByHandle(handle);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { items, addItem, clear } = useStorefrontCartStore();
  const selected = demoStoreProducts.find((p) => p.id === selectedId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <ProfileHero
        displayName={creator.displayName}
        handle={creator.handle}
        bio={creator.tagline}
        featuredCount={demoStoreProducts.length}
      />
      <FinancialSafetyNotice />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoStoreProducts.map((product) => (
          <StoreProductCard
            key={product.id}
            product={product}
            onSelect={(id) => {
              setSelectedId(id);
              trackStorefrontEngagement('view', id);
            }}
          />
        ))}
      </div>
      {selected ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ProductDetailPanel
            product={selected}
            onCheckout={() => {
              addItem({
                productId: selected.id,
                title: selected.title,
                priceLabel: selected.priceLabel,
              });
              trackStorefrontEngagement('add_to_cart', selected.id);
            }}
          />
          <CheckoutPlaceholder
            totalLabel={selected.priceLabel}
            itemCount={items.length || 1}
            onConfirm={() => {
              trackStorefrontEngagement('checkout_demo');
              clear();
            }}
          />
        </div>
      ) : null}
      <PurchaseHistoryPanel purchases={demoPurchases} />
    </div>
  );
}

export function CreatorMembershipExperience({ handle }: { handle: string }) {
  const creator = getCreatorByHandle(handle);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-fg">Support {creator.displayName}</h1>
        <p className="mt-2 text-sm text-muted">{creator.tagline}</p>
      </header>
      <p className="text-sm text-muted">
        Membership helps sustain independent work. Cancel anytime from billing settings.
      </p>
    </div>
  );
}
