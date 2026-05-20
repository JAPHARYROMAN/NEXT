import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GestureSurface } from './gesture-surface';

describe('gesture-system', () => {
  it('renders gesture surface with label', () => {
    render(
      <GestureSurface label="Feed gestures">
        <p>Content</p>
      </GestureSurface>,
    );
    expect(screen.getByLabelText('Feed gestures')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });
});
