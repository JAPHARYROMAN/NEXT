'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { tvShelfVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { FocusZone, Focusable } from '@next/remote-navigation';
import { trackTvShelfEngagement } from '@next/frontend-utils';

export interface TvShelfItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly hue?: number;
}

export interface TvShelfProps {
  readonly id: string;
  readonly title: string;
  readonly items: readonly TvShelfItem[];
  readonly onSelect?: (item: TvShelfItem) => void;
  readonly className?: string;
}

export function TvShelf({ id, title, items, onSelect, className }: TvShelfProps) {
  const reduced = useReducedMotion();

  return (
    <FocusZone zone={id} label={title} className={clsx('space-y-5', className)}>
      <h2 className="font-display text-2xl font-semibold tv:text-3xl">{title}</h2>
      <motion.ul
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-none"
        variants={motionSafe(tvShelfVariants, reduced)}
        initial="initial"
        animate="animate"
        role="list"
      >
        {items.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <Focusable
              focusId={`${id}-${item.id}`}
              row={0}
              col={i}
              zone={id}
              className="w-[18rem] tv:w-[22rem]"
              onClick={() => {
                trackTvShelfEngagement(id, 'select');
                onSelect?.(item);
              }}
            >
              <div
                className="mb-3 aspect-video w-full rounded-xl"
                style={{
                  background: `linear-gradient(145deg, hsl(${(item.hue ?? 200) + i * 12} 50% 28%), hsl(${(item.hue ?? 200) + 60} 40% 14%))`,
                }}
              />
              <p className="font-medium">{item.title}</p>
              {item.subtitle ? <p className="text-sm text-muted">{item.subtitle}</p> : null}
            </Focusable>
          </li>
        ))}
      </motion.ul>
    </FocusZone>
  );
}
