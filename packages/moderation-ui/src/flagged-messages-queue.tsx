'use client';

import clsx from 'clsx';
import { Button, Surface } from '@next/ui';
import type { FlaggedMessage } from './types';

export interface FlaggedMessagesQueueProps {
  readonly messages: readonly FlaggedMessage[];
  readonly onDismiss?: (id: string) => void;
  readonly onTimeout?: (id: string) => void;
  readonly className?: string;
}

export function FlaggedMessagesQueue({
  messages,
  onDismiss,
  onTimeout,
  className,
}: FlaggedMessagesQueueProps) {
  return (
    <Surface bordered className={clsx('p-4', className)} aria-label="Flagged messages">
      <h3 className="text-sm font-medium">Review queue</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg border border-subtle/15 p-3">
            <p className="font-medium">{m.author}</p>
            <p className="mt-1 text-muted">{m.excerpt}</p>
            <p className="mt-1 text-xs text-accent">{m.reason}</p>
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" onClick={() => onDismiss?.(m.id)}>
                Dismiss
              </Button>
              <Button variant="ghost" onClick={() => onTimeout?.(m.id)}>
                Timeout (demo)
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
