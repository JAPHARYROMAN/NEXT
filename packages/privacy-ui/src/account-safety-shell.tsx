'use client';

import { Surface } from '@next/ui';

export interface AccountSafetyShellProps {
  readonly sessionSummary: string;
}

export function AccountSafetyShell({ sessionSummary }: AccountSafetyShellProps) {
  return (
    <Surface bordered className="space-y-4 p-5" aria-labelledby="safety-heading">
      <h3 id="safety-heading" className="text-sm font-medium text-fg">
        Account safety
      </h3>
      <p className="text-sm text-muted">{sessionSummary}</p>
      <ul className="space-y-2 text-sm">
        <li>
          <button type="button" className="text-accent hover:underline">
            Review active sessions (placeholder)
          </button>
        </li>
        <li>
          <button type="button" className="text-accent hover:underline">
            Two-factor authentication (placeholder)
          </button>
        </li>
        <li>
          <button type="button" className="text-muted hover:text-fg">
            Download account data
          </button>
        </li>
      </ul>
    </Surface>
  );
}
