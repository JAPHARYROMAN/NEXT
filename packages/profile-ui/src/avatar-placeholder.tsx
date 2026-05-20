'use client';

import clsx from 'clsx';

export interface AvatarPlaceholderProps {
  readonly label: string;
  readonly variant?: string;
  readonly onUploadClick?: () => void;
  readonly className?: string;
}

export function AvatarPlaceholder({
  label,
  variant = 'gradient-aurora',
  onUploadClick,
  className,
}: AvatarPlaceholderProps) {
  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div
        className={clsx(
          'flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium text-bg',
          variant === 'gradient-aurora' && 'bg-gradient-to-br from-accent/80 to-subtle/60',
        )}
        aria-hidden="true"
      >
        {label.slice(0, 1).toUpperCase() || '?'}
      </div>
      <div>
        <button
          type="button"
          onClick={onUploadClick}
          className="rounded-lg border border-subtle/20 px-3 py-2 text-sm hover:bg-elevated/40"
        >
          Upload photo (placeholder)
        </button>
        <p className="mt-1 text-xs text-muted">
          Images stay on-device until upload service connects.
        </p>
      </div>
    </div>
  );
}
