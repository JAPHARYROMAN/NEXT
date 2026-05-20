'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { roomEntryVariants, useReducedMotion, motionSafe } from '@next/animation-system';
import { MemberPresence, type PresenceMember } from '@next/community-ui';
import { useWatchPartyStore, trackWatchPartyJoin } from '@next/frontend-utils';
import { DiscussionThread, type ThreadComment } from './discussion-thread';
import { ThreadComposer } from './thread-composer';

export interface WatchPartyRoomProps {
  readonly title: string;
  readonly host: string;
  readonly participants: readonly PresenceMember[];
  readonly queueLabel?: string;
  readonly postWatchComments?: readonly ThreadComment[];
  readonly phase?: 'sync' | 'watching' | 'discussion';
  readonly className?: string;
}

export function WatchPartyRoom({
  title,
  host,
  participants,
  queueLabel = 'Shared queue — 3 items',
  postWatchComments = [],
  phase = 'watching',
  className,
}: WatchPartyRoomProps) {
  const reduced = useReducedMotion();
  const isHost = useWatchPartyStore((s) => s.isHost);
  const syncOffset = useWatchPartyStore((s) => s.syncOffsetMs);

  return (
    <motion.div
      className={clsx('space-y-6', className)}
      variants={motionSafe(roomEntryVariants, reduced)}
      initial="initial"
      animate="animate"
      role="region"
      aria-label={`Watch party: ${title}`}
    >
      <header className="space-y-1">
        <p className="text-xs text-accent">Watch party · {phase}</p>
        <h2 className="font-display text-xl font-medium">{title}</h2>
        <p className="text-sm text-muted">
          Host {host}
          {isHost ? ' · You are hosting' : ''}
          {syncOffset != null ? ` · sync ${syncOffset}ms` : ''}
        </p>
      </header>

      <MemberPresence members={participants} />

      <div className="rounded-xl border border-subtle/15 bg-surface/30 p-4">
        <p className="text-xs text-muted">Sync viewport — connect player sync API</p>
        <div className="mt-3 aspect-video rounded-lg bg-elevated" aria-hidden />
        {isHost ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-lg bg-accent px-3 py-1.5 text-xs text-bg">
              Play for all
            </button>
            <button
              type="button"
              className="rounded-lg border border-subtle/20 px-3 py-1.5 text-xs"
            >
              Pause
            </button>
          </div>
        ) : null}
        <p className="mt-2 text-xs text-subtle">{queueLabel}</p>
      </div>

      <section aria-label="Party chat" className="space-y-2">
        <h3 className="text-sm font-medium">Group resonance</h3>
        <ThreadComposer placeholder="React together…" />
      </section>

      {phase === 'discussion' && postWatchComments.length > 0 ? (
        <DiscussionThread title="After the watch" comments={postWatchComments} />
      ) : null}

      <button
        type="button"
        className="sr-only"
        onClick={() => trackWatchPartyJoin(title, participants.length)}
      >
        Telemetry join ping
      </button>
    </motion.div>
  );
}
