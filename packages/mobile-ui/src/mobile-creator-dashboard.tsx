'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { SyncIndicator } from '@next/offline-ui';

export interface MobileCreatorDashboardProps {
  readonly analyticsPreview?: ReactNode;
  readonly uploadAction?: ReactNode;
  readonly className?: string;
}

export function MobileCreatorDashboard({
  analyticsPreview,
  uploadAction,
  className,
}: MobileCreatorDashboardProps) {
  return (
    <div className={clsx('space-y-6', className)} aria-label="Creator mobile dashboard">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Studio</h2>
        <SyncIndicator />
      </div>
      {uploadAction ? (
        <section aria-label="Quick upload">{uploadAction}</section>
      ) : (
        <p className="text-sm text-muted">Upload and quick edits sync across devices.</p>
      )}
      {analyticsPreview ? (
        <section aria-label="Analytics preview" className="rounded-2xl border border-subtle/15 p-4">
          {analyticsPreview}
        </section>
      ) : null}
    </div>
  );
}
