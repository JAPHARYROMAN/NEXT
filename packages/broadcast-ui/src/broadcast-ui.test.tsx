import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PreflightChecklist } from './preflight-checklist';
import { StreamHealthMetrics } from './stream-health-metrics';

describe('broadcast-ui', () => {
  it('renders preflight checklist', () => {
    render(<PreflightChecklist items={[{ id: '1', label: 'Audio levels', passed: true }]} />);
    expect(screen.getByLabelText('Preflight checklist')).toBeTruthy();
  });

  it('renders health metrics', () => {
    render(
      <StreamHealthMetrics
        metrics={[{ id: 'b', label: 'Bitrate', value: '6.2 Mbps', severity: 'ok' }]}
      />,
    );
    expect(screen.getByLabelText('Stream health metrics')).toBeTruthy();
  });
});
