import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoreProductCard } from './store-product-card';
import { CheckoutPlaceholder } from './checkout-placeholder';

describe('commerce-ui', () => {
  it('renders store product card', () => {
    render(
      <StoreProductCard
        product={{
          id: 'p1',
          title: 'Ambient pack',
          description: 'Field recordings',
          priceLabel: '$12',
          type: 'digital',
        }}
      />,
    );
    expect(screen.getByText('Ambient pack')).toBeTruthy();
  });

  it('renders checkout placeholder', () => {
    render(<CheckoutPlaceholder totalLabel="$12" itemCount={1} />);
    expect(screen.getByLabelText('Checkout placeholder')).toBeTruthy();
  });
});
