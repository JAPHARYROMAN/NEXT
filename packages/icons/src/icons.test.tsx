import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconHome } from './icons';

describe('IconHome', () => {
  it('renders with accessible name when label passed', () => {
    render(<IconHome label="Home" />);
    expect(screen.getByRole('img', { name: 'Home' })).toBeTruthy();
  });
});
