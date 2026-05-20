'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { chaosDriftVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Badge, Surface } from '@next/ui';
import type { ChaosItem } from './chaos-mode-shell';

export interface ChaosPortalProps {
  readonly items: readonly ChaosItem[];
  readonly title?: string;
  readonly className?: string;
}

export function ChaosPortal({ items, title = 'Strange discoveries', className }: ChaosPortalProps) {
  const reduced = useReducedMotion();

  return (
    <section className={clsx('space-y-6', className)} aria-label={title}>
      <div className="space-y-2">
        <Badge tone="accent">Chaos mode</Badge>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="max-w-xl text-muted">
          Premium unpredictability — underground culture, niche live, experimental media.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            variants={motionSafe(chaosDriftVariants, reduced)}
            initial="initial"
            animate="animate"
            transition={{ delay: reduced ? 0 : (i % 6) * 0.07 }}
          >
            <Link href={`/watch/${item.id}`}>
              <Surface bordered className="group overflow-hidden p-0">
                <div
                  className="aspect-[4/3] w-full transition-transform group-hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(${120 + i * 15}deg, hsl(${item.hue} 55% 32%), hsl(${(item.hue + 70) % 360} 45% 18%))`,
                  }}
                  aria-hidden
                />
                <div className="p-4">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.creator}</p>
                </div>
              </Surface>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
