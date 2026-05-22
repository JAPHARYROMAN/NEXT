'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { fadeVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { Surface } from '@next/ui';
import type { MembershipTier } from './types';

export interface MembershipTierCardProps {
  readonly tier: MembershipTier;
  readonly selected?: boolean;
  readonly onSelect?: (tierId: string) => void;
}

export function MembershipTierCard({ tier, selected, onSelect }: MembershipTierCardProps) {
  const reduced = useReducedMotion();
  const variants = motionSafe(fadeVariants, reduced);

  return (
    <motion.div variants={variants} initial="initial" animate="animate">
      <Surface
        bordered
        className={clsx(
          'flex h-full flex-col p-5 transition-colors',
          tier.highlighted && 'border-accent/40',
          selected && 'ring-2 ring-accent/50',
        )}
      >
        {tier.highlighted ? (
          <span className="mb-2 text-xs font-medium text-accent">Most supported</span>
        ) : null}
        <h3 className="text-base font-medium text-fg">{tier.name}</h3>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-fg">
          {tier.priceLabel}
          <span className="text-sm font-normal text-muted"> / {tier.interval}</span>
        </p>
        <p className="mt-2 text-sm text-muted">{tier.description}</p>
        <ul className="mt-4 flex-1 space-y-2 text-sm text-fg" aria-label={`${tier.name} benefits`}>
          {tier.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <span aria-hidden className="text-accent">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onSelect?.(tier.id)}
          className={clsx(
            'mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            selected
              ? 'bg-accent text-accent-fg'
              : 'border border-subtle/20 text-fg hover:bg-elevated/50',
          )}
          aria-pressed={selected}
        >
          {selected ? 'Selected' : 'Choose tier'}
        </button>
      </Surface>
    </motion.div>
  );
}
