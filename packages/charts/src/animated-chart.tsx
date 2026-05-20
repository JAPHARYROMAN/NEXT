'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { fadeVariants, motionSafe, useReducedMotion } from '@next/animation-system';

export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

export interface AnimatedChartProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly data: readonly ChartPoint[];
  readonly accent?: string;
  readonly className?: string;
  readonly footer?: ReactNode;
}

function normalize(values: readonly number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
}

export function AnimatedChart({
  title,
  subtitle,
  data,
  accent = 'rgb(var(--next-color-accent) / 0.85)',
  className,
  footer,
}: AnimatedChartProps) {
  const reduced = useReducedMotion();
  const heights = normalize(data.map((d) => d.value));
  const variants = motionSafe(fadeVariants, reduced);

  return (
    <motion.section
      className={clsx('rounded-xl border border-subtle/15 bg-surface p-5', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      aria-label={title}
    >
      <header className="mb-4">
        <h3 className="text-sm font-medium text-fg">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      </header>
      <div className="flex h-36 items-end gap-2" role="img" aria-label={`${title} bar chart`}>
        {data.map((point, i) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-md"
              style={{ background: accent }}
              initial={{ height: 0 }}
              animate={{ height: `${heights[i]! * 100}%` }}
              transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.04 }}
              aria-hidden
            />
            <span className="truncate text-[10px] text-muted">{point.label}</span>
          </div>
        ))}
      </div>
      {footer ? (
        <div className="mt-4 border-t border-subtle/10 pt-3 text-xs text-muted">{footer}</div>
      ) : null}
    </motion.section>
  );
}
