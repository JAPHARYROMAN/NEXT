import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('calls onClick', () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Press</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Press' }));
    expect(fn).toHaveBeenCalledOnce();
  });
});
