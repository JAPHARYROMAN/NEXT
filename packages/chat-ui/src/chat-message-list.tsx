'use client';

import clsx from 'clsx';
import { memo } from 'react';
import type { ChatMessage } from './types';

export interface ChatMessageListProps {
  readonly messages: readonly ChatMessage[];
  readonly maxVisible?: number;
  readonly className?: string;
}

const MessageRow = memo(function MessageRow({ message }: { message: ChatMessage }) {
  return (
    <li
      className={clsx(
        'rounded-lg px-2 py-1.5',
        message.highlight ? 'border border-accent/20 bg-accent/5' : 'bg-surface/40',
      )}
    >
      <span className="text-xs font-medium text-muted">{message.author}</span>
      <p className="mt-0.5 text-sm">{message.body}</p>
    </li>
  );
});

export function ChatMessageList({ messages, maxVisible = 40, className }: ChatMessageListProps) {
  const visible = messages.slice(-maxVisible);

  return (
    <ul
      className={clsx('max-h-56 space-y-2 overflow-y-auto text-sm', className)}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Chat messages"
    >
      {visible.map((m) => (
        <MessageRow key={m.id} message={m} />
      ))}
    </ul>
  );
}
