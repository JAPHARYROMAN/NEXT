import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatedChart } from './animated-chart';
import { MetricSparkline } from './metric-sparkline';

describe('charts', () => {
  it('renders animated chart with accessible label', () => {
    render(
      <AnimatedChart
        title="Engagement"
        data={[
          { label: 'Mon', value: 4 },
          { label: 'Tue', value: 7 },
        ]}
      />,
    );
    expect(screen.getByLabelText('Engagement')).toBeTruthy();
  });

  it('renders metric sparkline value', () => {
    render(<MetricSparkline label="Views" value="12.4k" delta="+8%" />);
    expect(screen.getByText('12.4k')).toBeTruthy();
  });
});
