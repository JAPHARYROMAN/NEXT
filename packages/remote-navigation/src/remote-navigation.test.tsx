import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FocusProvider } from './focus-context';
import { Focusable } from './focusable';
import { pickNeighbor } from './spatial-focus';

describe('remote-navigation', () => {
  it('picks spatial neighbor to the right', () => {
    const nodes = [
      { id: 'a', row: 0, col: 0 },
      { id: 'b', row: 0, col: 1 },
      { id: 'c', row: 1, col: 0 },
    ];
    expect(pickNeighbor(nodes[0]!, nodes, 'right')).toBe('b');
  });

  it('renders focusable with large hit target', () => {
    render(
      <FocusProvider defaultFocusId="hero">
        <Focusable focusId="hero" row={0} col={0}>
          Watch now
        </Focusable>
      </FocusProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Watch now' });
    expect(btn.className).toMatch(/min-h-\[3\.25rem\]/);
    fireEvent.focus(btn);
    expect(btn.getAttribute('data-focused')).toBe('true');
  });
});
