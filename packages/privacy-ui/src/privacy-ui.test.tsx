import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { ConsentPreferences } from './consent-preferences';
import { usePrivacyStore } from './store/privacy-store';

describe('privacy-ui', () => {
  beforeEach(() => {
    usePrivacyStore.getState().reset();
  });

  it('renders consent checkboxes', () => {
    render(<ConsentPreferences consent={usePrivacyStore.getState().consent} onChange={() => {}} />);
    expect(screen.getByText('Personalization')).toBeTruthy();
  });

  it('queues data export in store', () => {
    usePrivacyStore.getState().requestDataExport();
    expect(usePrivacyStore.getState().dataExportRequested).toBe(true);
  });
});
