'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { DashboardGrid } from './dashboard-grid';

export interface ControlRoomLayoutProps {
  readonly preview: ReactNode;
  readonly health: ReactNode;
  readonly chat: ReactNode;
  readonly moderation?: ReactNode;
  readonly clips?: ReactNode;
  readonly monetization?: ReactNode;
  readonly className?: string;
}

export function ControlRoomLayout({
  preview,
  health,
  chat,
  moderation,
  clips,
  monetization,
  className,
}: ControlRoomLayoutProps) {
  return (
    <div className={clsx('space-y-6', className)}>
      {preview}
      <DashboardGrid columns={2}>
        {health}
        {chat}
        {moderation}
        {clips}
        {monetization}
      </DashboardGrid>
    </div>
  );
}
