import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridZone } from './grid-zone';

describe('GridZone', () => {
  it('renders children', () => {
    render(
      <GridZone>
        <span>child</span>
      </GridZone>,
    );
    expect(screen.getByText('child')).toBeTruthy();
  });
});
