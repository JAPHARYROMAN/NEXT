'use client';

import { MetricSparkline } from '@next/charts';

export interface MetricTileProps {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly trend?: readonly number[];
}

export function MetricTile(props: MetricTileProps) {
  return <MetricSparkline {...props} />;
}
