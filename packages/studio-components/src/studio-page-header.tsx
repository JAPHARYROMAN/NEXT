'use client';

import { CinematicHeader } from '@next/creator-ui';
import type { ReactNode } from 'react';

export interface StudioPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
}

export function StudioPageHeader({ title, subtitle, actions }: StudioPageHeaderProps) {
  return (
    <CinematicHeader
      title={title}
      gradient="studio"
      {...(subtitle ? { subtitle } : {})}
      {...(actions ? { actions } : {})}
    />
  );
}
