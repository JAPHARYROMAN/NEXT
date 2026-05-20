'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  feedItemVariants,
  motionSafe,
  pageTransition,
  useReducedMotion,
} from '@next/animation-system';
import { focusRing } from '@next/design-system';

export interface MediaCardProps {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly href: string;
  readonly thumbnailHue?: number;
  readonly className?: string;
}

export function MediaCard({
  id,
  title,
  creator,
  href,
  thumbnailHue = 220,
  className,
}: MediaCardProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(feedItemVariants, reduced);

  return (
    <motion.article
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      transition={reduced ? { duration: 0 } : pageTransition}
      className={clsx('group', className)}
    >
      <Link href={href} className={clsx('block', focusRing)}>
        <div
          className="aspect-video w-full overflow-hidden rounded-xl bg-elevated shadow-elevation2 transition duration-smooth group-hover:shadow-elevation3"
          style={{
            background: `linear-gradient(145deg, hsl(${thumbnailHue} 40% 18%), hsl(${(thumbnailHue + 40) % 360} 35% 12%))`,
          }}
          aria-hidden
          data-media-id={id}
        />
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-fg">{title}</h3>
          <p className="text-xs text-muted">{creator}</p>
        </div>
      </Link>
    </motion.article>
  );
}
