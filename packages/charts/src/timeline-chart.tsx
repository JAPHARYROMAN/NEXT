'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';
import clsx from 'clsx';

export interface TimelineSegment {
  readonly at: string;
  readonly value: number;
}

export interface TimelineChartProps {
  readonly title: string;
  readonly segments: readonly TimelineSegment[];
  readonly className?: string;
}

export function TimelineChart({ title, segments, className }: TimelineChartProps) {
  const reduced = useReducedMotion();
  const max = Math.max(...segments.map((s) => s.value), 1);

  return (
    <section
      className={clsx('rounded-xl border border-subtle/15 bg-surface p-5', className)}
      aria-label={title}
    >
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="mt-4 space-y-3">
        {segments.map((seg, i) => (
          <div key={seg.at} className="grid grid-cols-[4rem_1fr] items-center gap-3">
            <span className="text-xs text-muted">{seg.at}</span>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <motion.div
                className="h-full rounded-full bg-accent/80"
                initial={{ width: 0 }}
                animate={{ width: `${(seg.value / max) * 100}%` }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.05 }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
