'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { discoveryRevealVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Badge, Surface } from '@next/ui';

export interface LiveNowItem {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly viewerLabel: string;
  readonly href: string;
  readonly hue?: number;
}

export interface LiveNowShelfProps {
  readonly items: readonly LiveNowItem[];
  readonly onItemClick?: (id: string) => void;
  readonly className?: string;
}

export function LiveNowShelf({ items, onItemClick, className }: LiveNowShelfProps) {
  const reduced = useReducedMotion();

  return (
    <section className={clsx('space-y-4', className)} aria-label="Live now">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-medium">Live now</h2>
        <Badge tone="danger">Broadcasting</Badge>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            variants={motionSafe(discoveryRevealVariants, reduced)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ delay: reduced ? 0 : i * 0.06 }}
            className="w-64 shrink-0"
          >
            <Link href={item.href} className="group block" onClick={() => onItemClick?.(item.id)}>
              <Surface bordered className="overflow-hidden p-0">
                <div
                  className="aspect-video w-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${item.hue ?? 10} 60% 35%), hsl(${(item.hue ?? 10) + 50} 50% 20%))`,
                  }}
                  aria-hidden
                />
                <div className="p-3">
                  <p className="line-clamp-1 font-medium">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.creator} · {item.viewerLabel}
                  </p>
                </div>
              </Surface>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
