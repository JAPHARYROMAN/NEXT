import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepProgress } from './step-progress';

describe('identity-ui', () => {
  it('exposes progressbar with step label', () => {
    render(
      <StepProgress
        steps={[
          { id: 'a', label: 'Welcome' },
          { id: 'b', label: 'Interests' },
        ]}
        currentIndex={0}
      />,
    );
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.getByText(/Step 1 of 2/)).toBeTruthy();
  });
});
