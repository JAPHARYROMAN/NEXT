'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { scrollRevealVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Surface, Badge } from '@next/ui';

export interface ChaosItem {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly hue: number;
}

export interface ChaosModeShellProps {
  readonly items: readonly ChaosItem[];
  readonly className?: string;
}

export function ChaosModeShell({ items, className }: ChaosModeShellProps) {
  const reduced = useReducedMotion();

  return (
    <section className={clsx('space-y-6', className)} aria-label="Chaos discovery">
      <div className="space-y-2">
        <Badge tone="accent">Chaos hour</Badge>
        <h2 className="font-display text-2xl font-semibold">Unpredictable discovery</h2>
        <p className="max-w-xl text-sm text-muted">
          Underground creators and experimental media — playful, human, never oppressive.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            variants={motionSafe(scrollRevealVariants, reduced)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: reduced ? 0 : (i % 5) * 0.08 }}
          >
            <Surface
              bordered
              className="group overflow-hidden p-0 transition-transform hover:scale-[1.02]"
            >
              <div
                className="aspect-video w-full"
                style={{
                  background: `linear-gradient(135deg, hsl(${item.hue} 60% 35%), hsl(${(item.hue + 40) % 360} 50% 20%))`,
                }}
                aria-hidden
              />
              <div className="p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted">{item.creator}</p>
              </div>
            </Surface>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
