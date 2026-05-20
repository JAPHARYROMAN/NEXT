'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { presenceVariants, useReducedMotion, motionSafe } from '@next/animation-system';

export interface PresenceMember {
  readonly id: string;
  readonly label: string;
  readonly status?: 'active' | 'listening' | 'away';
}

export interface MemberPresenceProps {
  readonly members: readonly PresenceMember[];
  readonly maxVisible?: number;
  readonly className?: string;
}

const statusTone = {
  active: 'bg-accent',
  listening: 'bg-brand',
  away: 'bg-subtle',
} as const;

export function MemberPresence({ members, maxVisible = 8, className }: MemberPresenceProps) {
  const reduced = useReducedMotion();
  const visible = members.slice(0, maxVisible);
  const overflow = members.length - visible.length;

  return (
    <div className={clsx('space-y-2', className)} role="region" aria-label="Member presence">
      <p className="text-xs font-medium text-muted">Resonating now</p>
      <ul className="flex flex-wrap gap-2">
        {visible.map((m, i) => (
          <motion.li
            key={m.id}
            variants={motionSafe(presenceVariants, reduced)}
            initial="initial"
            animate="animate"
            custom={i}
            className="flex items-center gap-2 rounded-full bg-surface/60 px-3 py-1.5 text-xs"
          >
            <span
              className={clsx('h-2 w-2 rounded-full', statusTone[m.status ?? 'active'])}
              aria-hidden
            />
            <span>{m.label}</span>
          </motion.li>
        ))}
        {overflow > 0 ? (
          <li className="rounded-full bg-elevated px-3 py-1.5 text-xs text-muted">
            +{overflow} more
          </li>
        ) : null}
      </ul>
    </div>
  );
}
