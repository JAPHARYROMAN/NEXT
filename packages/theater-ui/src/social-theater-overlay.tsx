'use client';

import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { presenceVariants, motionSafe, useReducedMotion } from '@next/animation-system';
import { MemberPresence } from '@next/community-ui';
import { useTvSessionStore } from '@next/frontend-utils';

export interface SocialTheaterOverlayProps {
  readonly reactions?: readonly string[];
  readonly members?: readonly { id: string; name: string; status: 'watching' | 'idle' }[];
  readonly className?: string;
}

/** Subtle couch-social layer — presence and reactions, not a chat wall. */
export function SocialTheaterOverlay({
  reactions = ['✨', '🎬', '🔥'],
  members = [],
  className,
}: SocialTheaterOverlayProps) {
  const overlay = useTvSessionStore((s) => s.playbackOverlay);
  const presence = useTvSessionStore((s) => s.watchPartyPresence);
  const reduced = useReducedMotion();
  const open = overlay === 'social';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          variants={motionSafe(presenceVariants, reduced)}
          initial="initial"
          animate="animate"
          exit="exit"
          className={clsx(
            'pointer-events-auto flex flex-col gap-4 rounded-2xl bg-black/55 p-6 backdrop-blur-md',
            className,
          )}
          aria-label="Social theater overlay"
        >
          <p className="text-sm text-muted">{presence} watching together</p>
          {members.length > 0 ? (
            <MemberPresence
              members={members.map((m) => ({
                id: m.id,
                label: m.name,
                status: m.status === 'watching' ? 'active' : 'away',
              }))}
            />
          ) : null}
          <div className="flex gap-3 text-2xl" role="list" aria-label="Quick reactions">
            {reactions.map((r) => (
              <span key={r} role="listitem">
                {r}
              </span>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
