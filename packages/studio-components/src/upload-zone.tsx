'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@next/animation-system';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { trackUploadFlow } from '@next/frontend-utils';

export interface UploadZoneProps {
  readonly onFiles?: (files: FileList) => void;
  readonly className?: string;
}

export function UploadZone({ onFiles, className }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const reduced = useReducedMotion();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      trackUploadFlow('files_selected', { count: files.length });
      onFiles?.(files);
    },
    [onFiles],
  );

  return (
    <motion.label
      className={clsx(
        'flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
        dragOver ? 'border-accent bg-accent/5' : 'border-subtle/25 hover:border-subtle/40',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      {...(!reduced && { animate: { scale: dragOver ? 1.01 : 1 }, transition: { duration: 0.2 } })}
    >
      <input
        type="file"
        className="sr-only"
        accept="video/*,audio/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        aria-label="Upload media files"
      />
      <span className="text-lg font-medium">Drop your work here</span>
      <span className="mt-2 text-sm text-muted">
        or browse — cinematic upload, resumable when API connects
      </span>
    </motion.label>
  );
}
