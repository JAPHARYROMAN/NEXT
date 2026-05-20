'use client';

import type { ReactNode } from 'react';
import { EntitlementGate } from '@next/entitlement-ui';
import type { EntitlementState } from '@next/entitlement-ui';
import { Surface } from '@next/ui';

export interface PremiumContentPreviewProps {
  readonly title: string;
  readonly description: string;
  readonly state: EntitlementState;
  readonly preview: ReactNode;
  readonly onUnlock?: () => void;
}

export function PremiumContentPreview({
  title,
  description,
  state,
  preview,
  onUnlock,
}: PremiumContentPreviewProps) {
  return (
    <EntitlementGate
      state={state}
      title={title}
      description={description}
      preview={preview}
      action={
        <button
          type="button"
          onClick={onUnlock}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-fg"
        >
          View options
        </button>
      }
    >
      {preview}
    </EntitlementGate>
  );
}

export interface PurchaseDecisionSurfaceProps {
  readonly options: readonly { id: string; label: string; priceLabel: string }[];
  readonly onSelect?: (id: string) => void;
}

export function PurchaseDecisionSurface({ options, onSelect }: PurchaseDecisionSurfaceProps) {
  return (
    <Surface bordered className="p-5" aria-label="Access options">
      <h3 className="text-sm font-medium text-fg">Choose how to access</h3>
      <p className="mt-1 text-sm text-muted">Clear pricing. Cancel anytime for subscriptions.</p>
      <ul className="mt-4 space-y-2" role="list">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onSelect?.(option.id)}
              className="flex w-full items-center justify-between rounded-lg border border-subtle/15 px-3 py-2.5 text-left text-sm hover:bg-elevated/40"
            >
              <span className="text-fg">{option.label}</span>
              <span className="font-medium text-fg">{option.priceLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
