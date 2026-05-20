'use client';

import { motion } from 'framer-motion';
import {
  feedItemVariants,
  motionSafe,
  useReducedMotion,
  useScrollMotion,
} from '@next/animation-system';
import { MediaCard } from '@next/ui';
import type { FeedItem } from '@next/frontend-utils';
import clsx from 'clsx';

export interface CinematicFeedItemProps {
  readonly item: FeedItem;
  readonly density?: 'comfortable' | 'compact' | 'immersive';
  readonly index?: number;
  readonly className?: string;
}

export function CinematicFeedItem({
  item,
  density = 'comfortable',
  index = 0,
  className,
}: CinematicFeedItemProps) {
  const reduced = useReducedMotion();
  const { progress } = useScrollMotion();

  return (
    <motion.div
      className={clsx(
        density === 'immersive' && 'col-span-full',
        density === 'compact' && 'scale-[0.98]',
        className,
      )}
      variants={motionSafe(feedItemVariants, reduced)}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-8%' }}
      transition={{ delay: reduced ? 0 : index * 0.04 }}
      style={{ opacity: reduced ? 1 : 0.85 + progress * 0.15 }}
    >
      <MediaCard
        id={item.id}
        title={item.title}
        creator={item.creator}
        href={`/watch/${item.id}`}
        thumbnailHue={item.thumbnailHue}
      />
    </motion.div>
  );
}
