'use client';

import { Surface } from '@next/ui';

export interface CancellationFlowProps {
  readonly tierName: string;
  readonly accessUntil: string;
  readonly onConfirmCancel?: () => void;
  readonly onKeep?: () => void;
}

export function CancellationFlow({
  tierName,
  accessUntil,
  onConfirmCancel,
  onKeep,
}: CancellationFlowProps) {
  return (
    <Surface bordered className="p-5" aria-labelledby="cancel-heading">
      <h3 id="cancel-heading" className="text-sm font-medium text-fg">
        Cancel {tierName}
      </h3>
      <p className="mt-2 text-sm text-muted">
        You keep full access until {accessUntil}. No hidden fees, no retention calls — just confirm
        below.
      </p>
      <ul className="mt-3 list-inside list-disc text-sm text-muted">
        <li>Access continues through your paid period</li>
        <li>Renewal stops automatically</li>
        <li>You can rejoin anytime</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirmCancel}
          className="rounded-lg border border-subtle/20 px-3 py-2 text-sm hover:bg-elevated/50"
        >
          Confirm cancellation
        </button>
        <button type="button" onClick={onKeep} className="rounded-lg px-3 py-2 text-sm text-accent">
          Keep membership
        </button>
      </div>
    </Surface>
  );
}
