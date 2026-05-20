'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';
import clsx from 'clsx';

export interface MetricSparklineProps {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly trend?: readonly number[];
  readonly className?: string;
}

export function MetricSparkline({
  label,
  value,
  delta,
  trend = [],
  className,
}: MetricSparklineProps) {
  const reduced = useReducedMotion();
  const points = trend.length > 1 ? trend : [3, 5, 4, 7, 6, 8, 9];
  const max = Math.max(...points, 1);
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={clsx('rounded-xl border border-subtle/15 bg-surface p-4', className)}>
      <p className="text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <motion.p
          className="text-2xl font-semibold tabular-nums"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          {value}
        </motion.p>
        {delta ? <span className="text-xs text-accent">{delta}</span> : null}
      </div>
      <svg viewBox="0 0 100 32" className="mt-3 h-8 w-full text-accent" aria-hidden>
        <motion.polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          points={coords}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.8 }}
        />
      </svg>
    </div>
  );
}
