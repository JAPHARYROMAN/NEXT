'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { focusEmergeVariants } from '@next/ambient-motion';
import { useAmbientMotion } from '@next/ambient-motion';
import { useImmersiveStore } from '@next/frontend-utils';

export interface DepthNavItem {
  readonly id: string;
  readonly label: string;
  readonly depth: number;
}

export interface DepthNavProps {
  readonly items: readonly DepthNavItem[];
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function DepthNav({ items, onSelect, className }: DepthNavProps) {
  const activeLayer = useImmersiveStore((s) => s.activeDepthLayer);
  const setDepthLayer = useImmersiveStore((s) => s.setDepthLayer);
  const { variants } = useAmbientMotion(focusEmergeVariants);

  return (
    <nav
      className={clsx('flex flex-col gap-2', className)}
      aria-label="Depth navigation"
      data-depth-nav
    >
      {items.map((item) => {
        const active = activeLayer === item.depth;
        return (
          <motion.button
            key={item.id}
            type="button"
            variants={variants}
            initial={false}
            animate={active ? 'animate' : 'initial'}
            className={clsx(
              'rounded-xl px-4 py-3 text-left text-sm transition-colors',
              active ? 'bg-elevated text-fg shadow-md' : 'bg-surface/60 text-muted hover:text-fg',
            )}
            style={{
              transform: `scale(${1 - item.depth * 0.02})`,
            }}
            aria-current={active ? 'true' : undefined}
            onClick={() => {
              setDepthLayer(item.depth);
              onSelect?.(item.id);
            }}
          >
            <span className="block font-medium">{item.label}</span>
            <span className="text-xs text-subtle">Layer {item.depth}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
