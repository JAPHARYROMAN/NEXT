import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TvShelf } from './tv-shelf';
import { FocusProvider } from '@next/remote-navigation';

describe('tv-ui', () => {
  it('renders cinematic shelf with list semantics', () => {
    render(
      <FocusProvider defaultFocusId="continue-1">
        <TvShelf
          id="continue"
          title="Continue watching"
          items={[{ id: '1', title: 'Echoes', subtitle: '42% watched' }]}
        />
      </FocusProvider>,
    );
    expect(screen.getByText('Continue watching')).toBeTruthy();
    expect(screen.getByText('Echoes')).toBeTruthy();
  });
});
