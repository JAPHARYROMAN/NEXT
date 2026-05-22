'use client';

import clsx from 'clsx';
import { trackContinuityHandoff, useContinuityStore } from '@next/frontend-utils';

export interface HandoffCardProps {
  readonly className?: string;
}

export function HandoffCard({ className }: HandoffCardProps) {
  const resume = useContinuityStore((s) => s.resume);
  const handoffTarget = useContinuityStore((s) => s.handoffTarget);
  const lastDevice = useContinuityStore((s) => s.lastDevice);
  const clearHandoff = useContinuityStore((s) => s.clearHandoff);

  if (!resume && !handoffTarget) return null;

  return (
    <article
      className={clsx('rounded-2xl border border-subtle/15 bg-surface/60 p-4', className)}
      aria-label="Continue watching"
    >
      {resume ? (
        <>
          <h3 className="font-display text-lg font-semibold">Resume on this device</h3>
          <p className="mt-1 text-sm text-muted">{resume.title}</p>
          <p className="mt-2 text-xs text-muted">
            {Math.floor(resume.positionSec / 60)}m in · last on {lastDevice}
          </p>
        </>
      ) : null}
      {handoffTarget ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm">Hand off to {handoffTarget}</p>
          <button
            type="button"
            className="min-h-[44px] rounded-lg bg-brand px-4 text-sm font-medium text-white"
            onClick={() => {
              if (resume) trackContinuityHandoff(lastDevice, handoffTarget, resume.mediaId);
              clearHandoff();
            }}
          >
            Continue
          </button>
        </div>
      ) : null}
    </article>
  );
}
