import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChaosExperience } from '@/features/chaos/chaos-experience';

describe('chaos experience', () => {
  it('renders chaos portal section', () => {
    render(<ChaosExperience />);
    expect(screen.getByLabelText('Chaos mode')).toBeTruthy();
  });
});
