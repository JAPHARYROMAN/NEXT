'use client';

import clsx from 'clsx';

export interface SubtitlesShellProps {
  readonly visible?: boolean;
  readonly line?: string;
  readonly className?: string;
}

export function SubtitlesShell({ visible = false, line, className }: SubtitlesShellProps) {
  if (!visible || !line) return null;

  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-6',
        className,
      )}
      role="region"
      aria-live="polite"
      aria-label="Subtitles"
    >
      <p className="max-w-2xl rounded-lg bg-black/70 px-4 py-2 text-center text-sm text-white/95">
        {line}
      </p>
    </div>
  );
}
