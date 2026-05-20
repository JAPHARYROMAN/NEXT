import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityHealth } from './community-health';
import { CreatorVerification } from './creator-verification';
import { CommerceSafetyWarning } from './commerce-safety';

describe('reputation-ui', () => {
  it('renders health progress', () => {
    render(<CommunityHealth score={82} signals={['Low toxicity']} />);
    expect(screen.getByLabelText('Community health')).toBeTruthy();
  });

  it('renders verification when verified', () => {
    render(<CreatorVerification verified label="Verified creator" />);
    expect(screen.getByText('Verified creator')).toBeTruthy();
  });

  it('renders commerce safety warning', () => {
    render(<CommerceSafetyWarning reason="Review terms carefully" />);
    expect(screen.getByLabelText('Commerce safety warning')).toBeTruthy();
  });
});
