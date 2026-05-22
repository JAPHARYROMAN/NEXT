'use client';

import clsx from 'clsx';
import { AmbientReactions } from '@next/interaction-ui';

export interface LiveChatMessage {
  readonly id: string;
  readonly author: string;
  readonly body: string;
}

export interface LiveChatShellProps {
  readonly messages: readonly LiveChatMessage[];
  readonly className?: string;
}

export function LiveChatShell({ messages, className }: LiveChatShellProps) {
  return (
    <section className={clsx('flex flex-col gap-3', className)} aria-label="Live chat">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Live chat</h3>
        <AmbientReactions />
      </div>
      <ul className="max-h-48 space-y-2 overflow-y-auto text-sm" role="log" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className="rounded-lg bg-surface/40 px-2 py-1.5">
            <span className="text-xs font-medium text-muted">{m.author}</span>
            <p className="mt-0.5">{m.body}</p>
          </li>
        ))}
      </ul>
      <label className="sr-only" htmlFor="live-chat-input">
        Send live message
      </label>
      <input
        id="live-chat-input"
        type="text"
        placeholder="Say something kind…"
        className="rounded-lg border border-subtle/20 bg-transparent px-3 py-2 text-sm"
      />
    </section>
  );
}
