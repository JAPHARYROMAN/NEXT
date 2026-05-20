'use client';

import clsx from 'clsx';
import { ChatMessageList } from './chat-message-list';
import { InteractionRail } from './interaction-rail';
import { SlowModeIndicator } from './slow-mode-indicator';
import type { ChatMessage } from './types';

export interface LiveChatPanelProps {
  readonly messages: readonly ChatMessage[];
  readonly slowMode?: boolean;
  readonly className?: string;
}

export function LiveChatPanel({ messages, slowMode, className }: LiveChatPanelProps) {
  return (
    <section className={clsx('flex flex-col gap-3', className)} aria-label="Live chat panel">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Live chat</h3>
        {slowMode ? <SlowModeIndicator /> : null}
      </div>
      <ChatMessageList messages={messages} />
      <InteractionRail />
      <label className="sr-only" htmlFor="chat-panel-input">
        Send message
      </label>
      <input
        id="chat-panel-input"
        type="text"
        placeholder="Contribute with care…"
        className="rounded-lg border border-subtle/20 bg-transparent px-3 py-2 text-sm"
      />
    </section>
  );
}
