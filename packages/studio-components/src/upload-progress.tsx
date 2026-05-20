'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';

export interface UploadProgressProps {
  readonly fileName: string;
  readonly percent: number;
  readonly chunked?: boolean;
}

export function UploadProgress({ fileName, percent, chunked }: UploadProgressProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className="rounded-xl border border-subtle/15 bg-surface p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-between text-sm">
        <span className="truncate font-medium">{fileName}</span>
        <span className="tabular-nums text-muted">{percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        />
      </div>
      {chunked ? <p className="mt-2 text-xs text-muted">Chunked upload — UI simulation</p> : null}
    </div>
  );
}
