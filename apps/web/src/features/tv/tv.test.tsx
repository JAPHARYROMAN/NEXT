import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TvShelf } from '@next/tv-ui';
import { FocusProvider } from '@next/remote-navigation';

describe('tv experience', () => {
  it('renders TV shelf for large-screen layout', () => {
    render(
      <FocusProvider>
        <TvShelf
          id="continue"
          title="Continue watching"
          items={[{ id: '1', title: 'Echoes in Static', subtitle: '42%' }]}
        />
      </FocusProvider>,
    );
    expect(screen.getByText('Continue watching')).toBeTruthy();
    expect(screen.getByText('Echoes in Static')).toBeTruthy();
  });
});
