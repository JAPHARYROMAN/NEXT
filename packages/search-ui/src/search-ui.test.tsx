import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './search-bar';
import { IntentModes } from './intent-modes';
import { SearchResults } from './search-results';

describe('search-ui', () => {
  it('renders search bar with role search', () => {
    render(<SearchBar value="" onChange={() => undefined} />);
    expect(screen.getByRole('search')).toBeTruthy();
  });

  it('submits search query', () => {
    const onSubmit = vi.fn();
    render(<SearchBar value="ambient night" onChange={() => undefined} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('search'));
    expect(onSubmit).toHaveBeenCalledWith('ambient night');
  });

  it('renders intent mode tabs', () => {
    render(<IntentModes active="explore" onChange={() => undefined} />);
    expect(screen.getByRole('tab', { name: 'Chaos' })).toBeTruthy();
  });

  it('shows zero-result guidance', () => {
    render(<SearchResults sections={[]} query="xyznone" />);
    expect(screen.getByText(/No results/)).toBeTruthy();
  });

  it('groups result sections with aria labels', () => {
    render(
      <SearchResults
        sections={[
          {
            id: 'media',
            title: 'Media',
            items: [
              {
                kind: 'media',
                id: 'm1',
                title: 'Night walk',
                creator: '@lumen',
                href: '/watch/m1',
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByLabelText('Media')).toBeTruthy();
    expect(screen.getByText('Night walk')).toBeTruthy();
  });
});
