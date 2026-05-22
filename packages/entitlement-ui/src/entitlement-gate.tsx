'use client';

import type { ReactNode } from 'react';
import { Surface } from '@next/ui';
import { EntitlementBadge } from './entitlement-badge';
import type { EntitlementState } from './types';

export interface EntitlementGateProps {
  readonly state: EntitlementState;
  readonly title: string;
  readonly description?: string;
  readonly preview?: ReactNode;
  readonly action?: ReactNode;
  readonly children?: ReactNode;
}

export function EntitlementGate({
  state,
  title,
  description,
  preview,
  action,
  children,
}: EntitlementGateProps) {
  if (state === 'entitled' || state === 'creator_comp') {
    return <>{children}</>;
  }

  return (
    <Surface bordered className="overflow-hidden">
      {preview ? (
        <div className="relative">
          <div className="pointer-events-none select-none opacity-60 blur-[1px]">{preview}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        </div>
      ) : null}
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-fg">{title}</h3>
          <EntitlementBadge state={state} />
        </div>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </Surface>
  );
}
