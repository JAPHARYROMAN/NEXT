'use client';

import clsx from 'clsx';
import { FlaggedMessagesQueue } from './flagged-messages-queue';
import { MutedUsersPanel } from './muted-users-panel';
import { ModRoleIndicator } from './mod-role-indicator';
import { EscalationBanner } from './escalation-banner';
import type { FlaggedMessage, MutedUser } from './types';

export interface ModerationConsoleProps {
  readonly flagged: readonly FlaggedMessage[];
  readonly muted: readonly MutedUser[];
  readonly escalation?: string;
  readonly className?: string;
}

export function ModerationConsole({
  flagged,
  muted,
  escalation,
  className,
}: ModerationConsoleProps) {
  return (
    <div className={clsx('space-y-4', className)} aria-label="Moderation console">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">Moderation</h3>
        <ModRoleIndicator role="moderator" />
      </div>
      {escalation ? <EscalationBanner message={escalation} /> : null}
      <FlaggedMessagesQueue messages={flagged} />
      <MutedUsersPanel users={muted} />
    </div>
  );
}
