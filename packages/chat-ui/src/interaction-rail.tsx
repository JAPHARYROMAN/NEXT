'use client';

import clsx from 'clsx';
import { Button, Surface } from '@next/ui';

export interface InteractionRailAction {
  readonly id: string;
  readonly label: string;
}

export interface InteractionRailProps {
  readonly actions?: readonly InteractionRailAction[];
  readonly onAction?: (id: string) => void;
  readonly className?: string;
}

const defaultActions: readonly InteractionRailAction[] = [
  { id: 'react', label: 'Appreciate' },
  { id: 'poll', label: 'Poll' },
  { id: 'question', label: 'Ask' },
];

export function InteractionRail({
  actions = defaultActions,
  onAction,
  className,
}: InteractionRailProps) {
  return (
    <Surface
      bordered
      className={clsx('flex flex-wrap gap-2 p-3', className)}
      aria-label="Interaction rail"
    >
      {actions.map((a) => (
        <Button key={a.id} variant="ghost" onClick={() => onAction?.(a.id)}>
          {a.label}
        </Button>
      ))}
    </Surface>
  );
}
