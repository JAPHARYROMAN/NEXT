'use client';

import clsx from 'clsx';
import { Badge } from '@next/ui';

export type ModRole = 'owner' | 'moderator' | 'trusted';

export interface ModRoleIndicatorProps {
  readonly role: ModRole;
  readonly className?: string;
}

export function ModRoleIndicator({ role, className }: ModRoleIndicatorProps) {
  return (
    <Badge tone="accent" className={clsx(className)}>
      {role}
    </Badge>
  );
}
