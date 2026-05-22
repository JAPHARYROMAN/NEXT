'use client';

import clsx from 'clsx';
import { ChaosModeShell, ChaosPortal, type ChaosItem } from '@next/discovery-ui';
import { trackChaosEntry } from '@next/frontend-utils';
import { Focusable } from '@next/remote-navigation';

export interface ChaosTvProps {
  readonly items: readonly ChaosItem[];
  readonly roomLabel?: string;
  readonly className?: string;
}

export function ChaosTv({ items, roomLabel = 'Late-night room', className }: ChaosTvProps) {
  return (
    <section className={clsx('space-y-10', className)} aria-label="Chaos TV">
      <ChaosPortal title="Chaos hour on TV" items={items.slice(0, 3)} />
      <ChaosModeShell items={items} />
      <Focusable
        focusId="chaos-random"
        row={2}
        col={0}
        onClick={() => trackChaosEntry('tv_random_room')}
      >
        Enter random discovery room — {roomLabel}
      </Focusable>
    </section>
  );
}
