'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { searchResultVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { CreatorCard, MediaCard, CommunityCard, Badge } from '@next/ui';
import type { SearchResultItem, ResultLayout } from './types';

export interface ResultSectionProps {
  readonly title: string;
  readonly items: readonly SearchResultItem[];
  readonly layout?: ResultLayout;
  readonly onResultClick?: (item: SearchResultItem) => void;
  readonly className?: string;
}

function resultKey(item: SearchResultItem): string {
  switch (item.kind) {
    case 'creator':
      return item.handle;
    case 'community':
      return item.slug;
    default:
      return item.id;
  }
}

function ResultItem({
  item,
  layout,
  onResultClick,
}: {
  item: SearchResultItem;
  layout: ResultLayout;
  onResultClick?: (item: SearchResultItem) => void;
}) {
  const reduced = useReducedMotion();

  const wrap = (node: React.ReactNode) => (
    <motion.div
      variants={motionSafe(searchResultVariants, reduced)}
      initial="initial"
      animate="animate"
      onClick={() => onResultClick?.(item)}
    >
      {node}
    </motion.div>
  );

  switch (item.kind) {
    case 'media':
      return wrap(
        <MediaCard
          id={item.id}
          title={item.title}
          creator={item.creator}
          href={item.href}
          {...(item.hue != null ? { thumbnailHue: item.hue } : {})}
          {...(layout === 'compact' ? { className: 'max-w-xs' } : {})}
        />,
      );
    case 'creator':
      return wrap(
        <CreatorCard
          handle={item.handle}
          displayName={item.name}
          href={item.href}
          {...(item.bio ? { bio: item.bio } : {})}
          {...(item.live != null ? { live: item.live } : {})}
        />,
      );
    case 'community':
      return wrap(
        <CommunityCard
          id={item.slug}
          name={item.name}
          description={item.description}
          memberCount={item.memberCount}
          href={item.href}
          {...(item.mood ? { mood: item.mood } : {})}
        />,
      );
    case 'live':
      return wrap(
        <Link href={item.href} className="group block">
          <div
            className="relative aspect-video overflow-hidden rounded-xl"
            style={{
              background: `linear-gradient(135deg, hsl(${item.hue ?? 0} 55% 30%), hsl(${(item.hue ?? 0) + 60} 45% 18%))`,
            }}
          >
            <Badge tone="danger" className="absolute left-3 top-3">
              Live · {item.viewerLabel}
            </Badge>
          </div>
          <p className="mt-2 font-medium">{item.title}</p>
          <p className="text-xs text-muted">{item.creator}</p>
        </Link>,
      );
    case 'topic':
      return wrap(
        <button
          type="button"
          className={clsx(
            'rounded-full px-4 py-2 text-sm',
            item.relation === 'near' && 'bg-accent/10 text-accent',
            item.relation === 'far' && 'bg-surface/60 text-muted',
            item.relation === 'wild' && 'bg-amber-500/10 text-amber-200',
          )}
        >
          {item.label}
          {item.resultCount != null ? (
            <span className="ml-2 text-xs opacity-70">{item.resultCount}</span>
          ) : null}
        </button>,
      );
    default:
      return null;
  }
}

const layoutGrid: Record<ResultLayout, string> = {
  mixed: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
  grouped: 'grid gap-4 sm:grid-cols-2',
  compact: 'flex flex-wrap gap-3',
  immersive: 'grid gap-6 sm:grid-cols-1 lg:grid-cols-2',
};

export function ResultSection({
  title,
  items,
  layout = 'mixed',
  onResultClick,
  className,
}: ResultSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className={clsx('space-y-4', className)} aria-label={title}>
      <h2 className="font-display text-lg font-medium">{title}</h2>
      <div className={layoutGrid[layout]}>
        {items.map((item) => (
          <ResultItem
            key={resultKey(item)}
            item={item}
            layout={layout}
            {...(onResultClick ? { onResultClick } : {})}
          />
        ))}
      </div>
    </section>
  );
}
