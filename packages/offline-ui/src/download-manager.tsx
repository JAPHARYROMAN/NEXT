'use client';

import clsx from 'clsx';
import { useOfflineSyncStore } from '@next/frontend-utils';

export interface DownloadManagerProps {
  readonly className?: string;
}

export function DownloadManager({ className }: DownloadManagerProps) {
  const downloads = useOfflineSyncStore((s) => s.downloads);
  const removeDownload = useOfflineSyncStore((s) => s.removeDownload);

  if (!downloads.length) {
    return (
      <p className={clsx('text-sm text-muted', className)} role="status">
        No downloads yet. Save videos for calm offline viewing.
      </p>
    );
  }

  return (
    <ul className={clsx('space-y-3', className)} aria-label="Download queue">
      {downloads.map((d) => (
        <li
          key={d.id}
          className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-subtle/15 bg-surface/50 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{d.title}</p>
            <p className="text-xs text-muted">
              {d.status === 'complete' ? 'Ready offline' : `${d.progress}%`}
            </p>
          </div>
          <button
            type="button"
            className="min-h-[44px] rounded-lg px-3 text-sm text-muted"
            onClick={() => removeDownload(d.id)}
            aria-label={`Remove ${d.title} from downloads`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
