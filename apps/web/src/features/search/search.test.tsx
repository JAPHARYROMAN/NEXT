import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchExperience } from '@/features/search/search-experience';

const stableParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => stableParams,
}));

describe('search experience', () => {
  it('renders semantic search heading', () => {
    render(<SearchExperience />);
    expect(screen.getByRole('heading', { name: 'Search' })).toBeTruthy();
  });

  it('exposes search form', () => {
    render(<SearchExperience />);
    expect(screen.getByRole('search')).toBeTruthy();
  });
});
